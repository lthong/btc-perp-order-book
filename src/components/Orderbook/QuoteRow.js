import React, { useMemo } from 'react';
import clsx from 'clsx';
import numeral from 'numeral';

const QuoteRow = ({ rowData, classNames, totalBarRenderer }) => {
  const { price, size, total, sizeColHighlight } = rowData;
  const totalBar = useMemo(
    () => totalBarRenderer(total),
    [totalBarRenderer, total]
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
        {totalBar}
        {numeral(total).format('0,0')}
      </div>
    </div>
  );
};

export default QuoteRow;
