import { useEffect, useState, useRef } from 'react';
import useWebSocket from 'react-use-websocket';

const useLastPrice = () => {
  const [lastPrice, setLastPrice] = useState(0);
  const [lastPriceHighlight, setLastPriceHighlight] = useState(null);
  const preLastPriceRef = useRef(0);

  // https://btsecom.github.io/docs/futures/en/#public-trade-fills
  const { sendMessage: sendLastPriceMsg, lastJsonMessage: lastPriceMsg } =
    useWebSocket('wss://ws.btse.com/ws/futures');

  useEffect(() => {
    sendLastPriceMsg(
      JSON.stringify({
        op: 'subscribe',
        args: ['tradeHistoryApi:BTCPFC'],
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastPriceMsg || !lastPriceMsg?.data?.length > 0) return;

    // TODO: check the default case
    const { price } = lastPriceMsg.data[0];
    const highlightValue =
      price > preLastPriceRef.current
        ? 'increase'
        : price < preLastPriceRef.current
        ? 'decrease'
        : '';
    setLastPriceHighlight(highlightValue);
    setLastPrice(price);
    preLastPriceRef.current = price;
  }, [lastPriceMsg]);

  return { lastPrice, lastPriceHighlight };
};

export default useLastPrice;
