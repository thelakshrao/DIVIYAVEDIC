export const imgUrl = (url, width = 500) => {
  if (!url) return "";
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
};