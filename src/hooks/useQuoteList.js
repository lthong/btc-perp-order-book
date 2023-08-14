import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import numeral from 'numeral';
import Decimal from 'decimal.js';

const QUOTE_LIST_AMOUNT = 8;

// xxxQuoteList example: [ { price: '111', size: '222', total: '222' }, ...]
const getQuoteList = ({ data, sort }) =>
  data
    ?.sort(([aPrice], [bPrice]) =>
      (sort === 'ASC'
        ? Decimal.sub(aPrice, bPrice)
        : Decimal.sub(bPrice, aPrice)
      ).toNumber()
    )
    .reduce((acc, item, index) => {
      const [price, size, sizeColHighlight = null] = item;
      // Sell quotes: sum up quote size from lowest price quote to the highest
      // Buy quotes: sum up quote size from highest price quote to the lowest
      const total =
        index === 0
          ? size
          : Decimal.add(acc[index - 1].total || 0, size).toString();

      return [...acc, { price, size, total, sizeColHighlight }];
    }, [])
    // Show max 8 quotes for both buy and sell.
    .filter((_, index) => index < QUOTE_LIST_AMOUNT);

// Bids and asks will be sent in price and size tuples.
// The size sent will be the new updated size for the price.
// If a value of 0 is sent, the price should be removed from the local copy of the orderbook.
const getNewQuoteData = (preData, data) => {
  const updatePriceKeys = data.map(([price]) => price);
  const preDataEntries = preData.reduce(
    (acc, [price, size]) => ({ ...acc, [price]: { price, size } }),
    {}
  );
  const dataBuffer = data.map(([price, size]) => {
    if (preDataEntries[price] && preDataEntries[price]?.size !== size) {
      // When quote size change, add highlight animation on size cell. Green background color if size increase. Red background color if size decrease.
      const sizeColHighlight =
        preDataEntries[price].size < size ? 'increase' : 'decrease';
      return [price, size, sizeColHighlight];
    }
    return [price, size];
  });

  const newData = [
    ...preData.filter(([price]) => !updatePriceKeys.includes(price)),
    ...dataBuffer,
  ].filter(([_, size]) => size > 0);

  return newData;
};

const useQuoteList = () => {
  // xxxData example (price and size tuples): [[111, 222], [333, 444], ...]
  const [asksData, setAsksData] = useState([]);
  const [bidsData, setBidsData] = useState([]);

  // https://btsecom.github.io/docs/futures/en/#orderbook-incremental-updates
  const { sendMessage: sendQuoteListMsg, lastJsonMessage: lastQuoteListMsg } =
    useWebSocket('wss://ws.btse.com/ws/oss/futures');

  useEffect(() => {
    sendQuoteListMsg(
      JSON.stringify({
        op: 'subscribe',
        args: ['update:BTCPFC_0'],
      })
    );
    return () => {
      sendQuoteListMsg(
        JSON.stringify({
          op: 'subscribe',
          args: ['update:BTCPFC_0'],
        })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastQuoteListMsg) return;

    const {
      data: { type, asks, bids, seqNum, prevSeqNum } = {
        type: '',
        asks: [],
        bids: [],
        seqNum: 0,
        prevSeqNum: 0,
      },
    } = lastQuoteListMsg;

    // The first response received will be a snapshot of the current orderbook (this is indicated in the type field) and 50 levels will be returned.
    if (type === 'snapshot') {
      setAsksData(asks);
      setBidsData(bids);
    }
    // Incremental updates will be sent in subsequent packets with type delta.
    else if (type === 'delta') {
      // To ensure that the updates are received in sequence, seqNum indicates the current sequence and prevSeqNum refers to the packet before.
      // seqNum will always be one after the prevSeqNum.If the sequence is out of order, you will need to unsubscribe and resubscribe to the topic again.
      if (seqNum !== prevSeqNum + 1) {
        sendQuoteListMsg(
          JSON.stringify({
            op: 'unsubscribe',
            args: ['update:BTCPFC_0'],
          })
        );
        sendQuoteListMsg(
          JSON.stringify({
            op: 'subscribe',
            args: ['update:BTCPFC_0'],
          })
        );
      } else {
        setAsksData((preState) => {
          return getNewQuoteData(preState, asks);
        });
        setBidsData((preState) => {
          return getNewQuoteData(preState, bids);
        });
      }
    }
  }, [lastQuoteListMsg, sendQuoteListMsg]);

  const asksQuoteList = useMemo(
    () => getQuoteList({ data: asksData, sort: 'ASC' }).reverse(),
    [asksData]
  );

  const bidsQuoteList = useMemo(
    () => getQuoteList({ data: bidsData, sort: 'DESC' }),
    [bidsData]
  );

  const totalQuoteSize = useMemo(
    () =>
      Decimal.max(
        asksQuoteList[0]?.total || 0,
        bidsQuoteList[QUOTE_LIST_AMOUNT - 1]?.total || 0
      ).toString(),
    [asksQuoteList, bidsQuoteList]
  );

  return {
    asksQuoteList,
    bidsQuoteList,
    totalQuoteSize,
  };
};

export default useQuoteList;
