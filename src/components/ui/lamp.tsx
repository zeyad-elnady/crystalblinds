"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center md:justify-start overflow-hidden bg-[#1a0f08] w-full z-0 pt-24 md:pt-28 pb-16 md:pb-12",
        className
      )}
    >
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex w-full scale-y-125 items-center justify-center isolate z-0 pointer-events-none transition-all duration-300",
          isMobile ? "top-1/2 -translate-y-[70%] h-[24rem]" : "top-0 h-[34rem]"
        )}
      >
        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "8rem" : "15rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "18rem" : "30rem" }}
          transition={{
            delay: 2.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto right-1/2 h-56 overflow-visible bg-gradient-conic from-[#d4af37] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]",
            isMobile ? "w-[18rem]" : "w-[30rem]"
          )}
        >
          <div className="absolute w-[100%] left-0 bg-[#1a0f08] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-[#1a0f08] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "8rem" : "15rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "18rem" : "30rem" }}
          transition={{
            delay: 2.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto left-1/2 h-56 bg-gradient-conic from-transparent via-transparent to-[#d4af37] text-white [--conic-position:from_290deg_at_center_top]",
            isMobile ? "w-[18rem]" : "w-[30rem]"
          )}
        >
          <div className="absolute w-40 h-[100%] right-0 bg-[#1a0f08] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-[#1a0f08] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#1a0f08] blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>

        <div
          className={cn(
            "absolute inset-auto z-50 h-36 rounded-full bg-[#d4af37] opacity-50 blur-3xl transition-all duration-300",
            isMobile ? "w-[16rem] -translate-y-[2rem]" : "w-[28rem] -translate-y-1/2"
          )}
        ></div>

        <motion.div
          initial={{ width: isMobile ? "5rem" : "8rem" }}
          whileInView={{ width: isMobile ? "10rem" : "16rem" }}
          transition={{
            delay: 2.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-auto z-30 h-36 rounded-full bg-[#e9c176] blur-2xl transition-all duration-300",
            isMobile ? "w-40 -translate-y-[4rem]" : "w-64 -translate-y-[6rem]"
          )}
        ></motion.div>

        <motion.div
          initial={{ width: isMobile ? "8rem" : "15rem" }}
          whileInView={{ width: isMobile ? "18rem" : "30rem" }}
          transition={{
            delay: 2.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-auto z-50 h-0.5 bg-[#e9c176] transition-all duration-300",
            isMobile ? "w-[18rem] -translate-y-[5rem]" : "w-[30rem] -translate-y-[7rem]"
          )}
        ></motion.div>

        <div
          className={cn(
            "absolute inset-auto z-40 h-44 w-full bg-[#1a0f08] transition-all duration-300",
            isMobile ? "-translate-y-[10.5rem]" : "-translate-y-[12.5rem]"
          )}
        ></div>
      </div>

      <div className="relative z-50 flex flex-col items-center px-4 sm:px-5 w-full">
        {children}
      </div>
    </div>
  );
};
