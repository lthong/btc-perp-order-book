import React from 'react';
import clsx from 'clsx';
import numeral from 'numeral';
import useLastPrice from '@/hooks/useLastPrice';

const LastPrice = () => {
  const { lastPrice, lastPriceHighlight } = useLastPrice();

  return (
    <div
      className={clsx('last-price', {
        [lastPriceHighlight]: !!lastPriceHighlight,
      })}
    >
      <span>{numeral(lastPrice).format('0,0.0')}</span>
      <div className='arrow-icon' />
    </div>
  );
};

export default LastPrice;
