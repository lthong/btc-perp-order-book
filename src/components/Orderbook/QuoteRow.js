import React, { useMemo } from 'react';
import clsx from 'clsx';
import numeral from 'numeral';
import Decimal from 'decimal.js';

const QuoteRow = ({ rowData, classNames, totalQuoteSize }) => {
  const { price, size, total, sizeColHighlight } = rowData;

  // Accumulative total size percentage bar formula:
  //   Current quote accumulative total size / Total quote size of buy or sell
  const barWidth = useMemo(
    () => numeral(Decimal.div(total, totalQuoteSize).toNumber()).format('0%'),
    [totalQuoteSize, total]
  );

  return (
    <div className={clsx('row', { [classNames]: !!classNames })}>
      <div className='cell price'>{numeral(price).format('0,0.0')}</div>
      <div
        className={clsx('cell size', {
          // When quote size change, add highlight animation on size cell. Green background color if size increase. Red background color if size decrease.
          // sizeColHighlight: 'increase' or 'decrease'
          [sizeColHighlight]: !!sizeColHighlight,
        })}
      >
        {numeral(size).format('0,0')}
      </div>
      <div className='cell total'>
        <div className='bar' style={{ width: barWidth }} />
        {numeral(total).format('0,0')}
      </div>
    </div>
  );
};

export default QuoteRow;
