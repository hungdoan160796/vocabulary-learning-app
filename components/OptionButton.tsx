interface Props {
  option: string
  onClick: () => void
  state: "default" | "correct" | "wrong"
}

export default function OptionButton({
  option,
  onClick,
  state,
}: Props) {
  const getClass = () => {
    switch (state) {
      case "correct":
        return "bg-green-500 text-white border-green-500"

      case "wrong":
        return "bg-red-500 text-white border-red-500"

      default:
        return "bg-white text-black border-gray-300"
    }
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        p-4
        text-lg
        font-medium
        transition-all
        active:scale-[0.98]
        ${getClass()}
      `}
    >
      {option}
    </button>
  )
}