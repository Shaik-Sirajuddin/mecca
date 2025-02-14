interface Props {
  children: React.ReactNode;
  loading: boolean;
}
const LoadingWrapper: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          display: "flex",
        }}
      >
        <div
          style={{
            display: props.loading ? "inline-block" : "none",
          }}
          id="loader"
          className="btn-sky w-full text-xl"
        />
        {props.children}
      </div>
    </div>
  );
};

export default LoadingWrapper;
