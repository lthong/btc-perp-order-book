import React from 'react';
import useQuoteList from '@/hooks/useQuoteList';
import QuoteRow from '@/components/Orderbook/QuoteRow';
import LastPrice from '@/components/Orderbook/LastPrice';

const Orderbook = () => {
  const { asksQuoteList, bidsQuoteList, totalBarRenderer } = useQuoteList();

  return (
    <div className='order-book'>
      <div className='header'>
        <div className='title'>Order Book</div>
      </div>
      <div className='quote-table'>
        <div className='col-header'>
          <div className='cell price'>Price (USD)</div>
          <div className='cell size'>Size</div>
          <div className='cell total'>Total</div>
        </div>
        <div className='quote-list'>
          {/* Sell quotes */}
          {asksQuoteList.map((rowData) => (
            <QuoteRow
              key={`${rowData.price}`}
              rowData={rowData}
              classNames='ask'
              totalBarRenderer={totalBarRenderer}
            />
          ))}
          <LastPrice />
          {/* Buy quotes */}
          {bidsQuoteList.map((rowData) => (
            <QuoteRow
              key={`${rowData.price}`}
              rowData={rowData}
              classNames='bid'
              totalBarRenderer={totalBarRenderer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
