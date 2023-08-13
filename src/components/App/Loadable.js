import Loadable from 'react-loadable';

const Loading = (props) => {
  if (props.pastDelay) {
    return 'Loading...';
  } else {
    return null;
  }
};

export const Orderbook = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'Orderbook' */ '@/components/Orderbook'),
  loading: Loading,
});
