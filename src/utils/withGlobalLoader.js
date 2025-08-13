import useLoadingStore from "../store/loadingStore";

export default async function withGlobalLoader(promiseFn) {
  const { setLoading } = useLoadingStore.getState();
  try {
    setLoading(true);
    return await promiseFn();
  } finally {
    setLoading(false);
  }
}