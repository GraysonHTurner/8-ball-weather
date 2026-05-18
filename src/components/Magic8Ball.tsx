'use client';

import { motion, PanInfo } from 'framer-motion';

interface Magic8BallProps {
  isShaking: boolean;
  answer: string | null;
  onShake?: () => void;
}

export default function Magic8Ball({ isShaking, answer, onShake }: Magic8BallProps) {
  // Floating up animation for the triangle
  const floatVariants: any = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      y: 40,
      rotateZ: -15,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateZ: 0,
      transition: { 
        duration: 1.5, 
        ease: "easeOut" 
      }
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate how far or fast the ball was dragged
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
    
    // Only trigger if it was actually shaken/moved a bit, not just clicked
    if ((distance > 15 || velocity > 100) && onShake && !isShaking) {
      onShake();
    }
  };

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] z-20">
      <motion.div
        drag
        dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }}
        dragElastic={0.2}
        dragSnapToOrigin={true}
        onDragEnd={handleDragEnd}
        className={`w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#333,_#000)] flex items-center justify-center relative overflow-hidden border-2 border-gray-900 ${!isShaking ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{
          boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.9), inset 10px 10px 20px rgba(255,255,255,0.2)'
        }}
      >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black flex items-center justify-center border-4 border-gray-800 shadow-[inset_0_0_25px_10px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Blue liquid effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.5),_rgba(0,0,0,1))]" />
          
          {/* The triangle inside */}
          {answer ? (
            <motion.div 
              key={answer} // Retrigger animation when answer changes
              variants={floatVariants}
              initial="hidden"
              animate="visible"
              className="relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center"
            >
              {/* Triangle SVG */}
              <svg className="absolute inset-0 w-full h-full drop-shadow-[0_5px_10px_rgba(0,0,0,0.9)] z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="5,5 95,5 50,90" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <div className="absolute top-[18%] md:top-[20%] w-[65%] flex items-center justify-center">
                <span className="relative z-10 text-[9px] md:text-[11px] text-blue-50 text-center font-bold uppercase tracking-tighter leading-[1.1] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                  {answer}
                </span>
              </div>
            </motion.div>
          ) : !isShaking ? (
            <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white rounded-full text-black text-4xl md:text-5xl font-serif font-bold shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
              8
            </div>
          ) : null}
          
          {/* Glass reflection */}
          <div className="absolute top-[10%] left-[15%] w-[60%] h-[30%] bg-gradient-to-b from-white/30 to-transparent rounded-[100%] rotate-[-20deg] pointer-events-none blur-[1px]" />
        </div>

        {/* Global Ball Highlights */}
        <div className="absolute top-4 left-8 w-24 h-12 bg-white/20 rounded-[100%] rotate-[-30deg] blur-md" />
      </motion.div>
    </div>
  );
}
