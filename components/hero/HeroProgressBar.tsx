"use client";

import { motion } from "framer-motion";

export default function HeroProgressBar({
    slideKey,
    duration = 7,
}: {
    slideKey: number;
    duration?: number;
}) {
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden">
            <motion.div
                key={slideKey}
                className="h-full bg-[#bc1c4f]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                    duration,
                    ease: "linear",
                }}
            />
        </div>
    );
}