"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useMousePosition from "@/composables/useMousePosition";

function page() {
  const mousePosition = useMousePosition();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [path, setPath] = useState(
    "M 50 50 L 50 200 L 50 350 L 150 350 L 150 200 L 150 50 Z",
  );

  useEffect(() => {
    if (mousePosition.x === null || mousePosition.y === null) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    // control svg each point
    const positionPoint = {
      topLeft: "M 50 50",
      midLeft: "L 50 200",
      botLeft: "L 50 350",
      botRight: "L 150 350",
      midRight: "L 150 200",
      topRight: "L 150 50",
    };

    switch (true) {
      case mousePosition.x <= svgRect.left:
        // case: top left
        if (mousePosition.y <= svgRect.top) {
          positionPoint.topLeft = "M 0 0";
          positionPoint.topRight = "L 100 0";
        }
        // case: mid left
        else if (
          mousePosition.y > svgRect.top &&
          mousePosition.y < svgRect.bottom
        ) {
          positionPoint.midLeft = "L 0 200";
          positionPoint.midRight = "L 100 200";
        }
        // case: bot left
        else if (mousePosition.y >= svgRect.bottom) {
          positionPoint.botLeft = "L 0 400";
          positionPoint.botRight = "L 100 400";
        }
        break;

      case mousePosition.x > svgRect.left && mousePosition.x < svgRect.right:
        // case: top center
        if (mousePosition.y <= svgRect.top) {
          positionPoint.topLeft = "M 75 0";
          positionPoint.topRight = "L 125 0";
        }
        // case: mid center
        else if (
          mousePosition.y > svgRect.top &&
          mousePosition.y < svgRect.bottom
        ) {
          // keep original shape
        }
        // case: bot center
        else if (mousePosition.y >= svgRect.bottom) {
          positionPoint.botLeft = "L 75 400";
          positionPoint.botRight = "L 125 400";
        }
        break;
      case mousePosition.x >= svgRect.right:
        // case: top right
        if (mousePosition.y <= svgRect.top) {
          positionPoint.topLeft = "M 100 0";
          positionPoint.topRight = "L 200 0";
        }
        // case: mid right
        else if (
          mousePosition.y > svgRect.top &&
          mousePosition.y < svgRect.bottom
        ) {
          positionPoint.midLeft = "L 100 200";
          positionPoint.midRight = "L 200 200";
        }
        // case: bot right
        else if (mousePosition.y >= svgRect.bottom) {
          positionPoint.botLeft = "L 100 400";
          positionPoint.botRight = "L 200 400";
        }
        break;
    }

    setPath(Object.values(positionPoint).join(" ") + " Z");
  }, [mousePosition]);

  return (
    <div className="flex h-screen items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        fill="none"
        overflow="visible"
      >
        <title>Circle</title>
        <motion.path
          d="
          M 100 0 
          C 155.228 0 200 44.772 200 100 
          C 200 155.228 155.228 200 100 200 
          C 44.772 200 0 155.228 0 100 
          C 0 44.772 44.772 0 100 0 Z"
          fill="#CCC"
        />
      </svg>
    </div>
  );
}

export default page;
