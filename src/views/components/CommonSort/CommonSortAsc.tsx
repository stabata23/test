// 昇順ソート
export default function sortAsc(sortKey: string, a: any, b: any) {
  if (a[sortKey] < b[sortKey]) {
    return -1;
  } else {
    return 1;
  }
}