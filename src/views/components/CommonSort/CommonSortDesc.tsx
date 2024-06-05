// 降順ソート
export default function sortDesc(sortKey: string, a: any, b: any) {
  if (a[sortKey] > b[sortKey]) {
    return -1;
  } else {
    return 1;
  }
}

