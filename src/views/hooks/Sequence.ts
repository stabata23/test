
import { useSessionData } from "../components/CommonSession/CommonSession";
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 採番対象のテーブルに登録があった場合に呼出して、次に登録する値に更新する
export const Sequence = () => {
  
    // セッションカスタムhook
    const { getImo } = useSessionData();
    const updateNextSequence = async(seqPrefix:string) => {
      const imo = getImo()!;
      // 更新対象を取得
      // const res = await client.graphql({
      //     query: getSequence,
      //     variables: {
      //       imo: imo,
      //       seqPrefix:seqPrefix
      //     }
      // });
      const res = await client.models.Sequence.get({
        imo: imo,
        seqPrefix:seqPrefix
      });
      if (res.data) {
        const newVal = Number(res.data.currentValue) + 1;
        const inputData = {
          imo: imo,
          seqPrefix:seqPrefix,
          currentValue: String(newVal)
        }
        await client.models.Sequence.update(inputData);
      }
    }
    return { updateNextSequence };
};