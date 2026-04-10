type Props = {
  url?: string | null;
  name?: string;
  size?: number;
};

export default function Avatar({ url, name = '?', size = 40 }: Props) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-300"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
