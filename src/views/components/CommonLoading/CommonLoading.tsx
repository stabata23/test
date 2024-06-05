import ReactLoading from "react-loading";
import "./CommonLoading.css"

// 親コンポーネントから持ち回る値
type Props = {
  isLoading: boolean;
};

// ローディングcomponent
export const Loading: React.FC<Props> = props => {

  return (
    <>
      {props.isLoading ?
        <div className="com04-loading-area">
          <ReactLoading
            type="spin"
            color="gray"
            height="50px"
            width="50px"
            className="com04-loading"
          />
        </div> :
        <></>
      }
    </>
  )
};

export default Loading;