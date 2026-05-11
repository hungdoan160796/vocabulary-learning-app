"use client"

import { useSwipeable } from "react-swipeable"

interface Props {
  onNext: () => void
  onPrev: () => void
  children: React.ReactNode
}

export default function SwipeContainer({
  onNext,
  onPrev,
  children,
}: Props) {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    trackMouse: true,
  })

  return <div {...handlers}>{children}</div>
}