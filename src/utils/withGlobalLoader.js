import useLoadingStore from "../store/loadingStore";

export default async function withGlobalLoader(promiseFn, loadingText = "Cargando...") {
  const { setLoading, setLoadingText } = useLoadingStore.getState();
  
  try {
    setLoading(true);
    setLoadingText(loadingText);
    return await promiseFn();
  } finally {
    setLoading(false);
    setLoadingText("Cargando...");
  }
}