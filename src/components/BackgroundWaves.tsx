import "../styles/components/Wave.css"
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BackgroundProps {
    top: boolean;
    bottom: boolean;
    color1: string;
    color2: string;
    color3: string;
}

const BackgroundWaves: React.FC<BackgroundProps> = ({top, bottom, color1, color2, color3}) => {
    const wave1Bottom = useRef(null);
    const wave2Bottom = useRef(null);
    const wave3Bottom = useRef(null);

    const wave1Top = useRef(null);
    const wave2Top = useRef(null);
    const wave3Top = useRef(null);

    useEffect(() => {
        const animateWave = (
            wave: SVGPathElement | null,
            _d1: string,
            d2: string,
            duration: number
        ) => {
            if (!wave) return;
        
            gsap.to(wave, {
                duration,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                attr: { d: d2 },
            });
        };

        animateWave(wave1Bottom.current, "M0,200 C480,150 960,100 1440,120 V300 H0 Z", "M0,220 C500,180 1000,140 1440,160 V300 H0 Z", 6);
        animateWave(wave2Bottom.current, "M0,220 C480,170 960,130 1440,140 V300 H0 Z", "M0,230 C500,190 1000,160 1440,170 V300 H0 Z", 8);
        animateWave(wave3Bottom.current, "M0,250 C480,200 960,180 1440,190 V300 H0 Z", "M0,260 C500,210 1000,200 1440,210 V300 H0 Z", 10);

        animateWave(wave1Top.current, "M0,200 C480,150 960,100 1440,120 V300 H0 Z", "M0,220 C500,180 1000,140 1440,160 V300 H0 Z", 6);
        animateWave(wave2Top.current, "M0,220 C480,170 960,130 1440,140 V300 H0 Z", "M0,230 C500,190 1000,160 1440,170 V300 H0 Z", 8);
        animateWave(wave3Top.current, "M0,250 C480,200 960,180 1440,190 V300 H0 Z", "M0,260 C500,210 1000,200 1440,210 V300 H0 Z", 10);
    }, []);

    return (
        <div className="background-waves">
            {top && <div className="top-waves">
                <svg viewBox="0 0 1440 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wave-gradient-top-1" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color1} offset="0%" />
                            <stop stopColor={color2} offset="100%" />
                        </linearGradient>
                        <linearGradient id="wave-gradient-top-2" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color2} offset="0%" />
                            <stop stopColor={color3} offset="100%" />
                        </linearGradient>
                        <linearGradient id="wave-gradient-top-3" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color3} offset="0%" />
                            <stop stopColor="var(--themecolor6)" offset="100%" />
                        </linearGradient>
                    </defs>
                    <path ref={wave1Top} fill="url(#wave-gradient-top-1)" d="M0,200 C480,150 960,100 1440,120 V300 H0 Z" />
                    <path ref={wave2Top} fill="url(#wave-gradient-top-2)" opacity="0.6" d="M0,220 C480,170 960,130 1440,140 V300 H0 Z" />
                    <path ref={wave3Top} fill="url(#wave-gradient-top-3)" opacity="0.4" d="M0,250 C480,200 960,180 1440,190 V300 H0 Z" />
                </svg>
            </div>}
            {bottom && <div className="bottom-waves">
                <svg viewBox="0 0 1440 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wave-gradient-bottom-1" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color1} offset="0%" />
                            <stop stopColor={color2} offset="100%" />
                        </linearGradient>
                        <linearGradient id="wave-gradient-bottom-2" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color2} offset="0%" />
                            <stop stopColor={color3} offset="100%" />
                        </linearGradient>
                        <linearGradient id="wave-gradient-bottom-3" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor={color3} offset="0%" />
                            <stop stopColor="var(--themecolor6)" offset="100%" />
                        </linearGradient>
                    </defs>

                    <path ref={wave1Bottom} fill="url(#wave-gradient-bottom-1)" d="M0,200 C480,150 960,100 1440,120 V300 H0 Z" />
                    <path ref={wave2Bottom} fill="url(#wave-gradient-bottom-2)" opacity="0.6" d="M0,220 C480,170 960,130 1440,140 V300 H0 Z" />
                    <path ref={wave3Bottom} fill="url(#wave-gradient-bottom-3)" opacity="0.4" d="M0,250 C480,200 960,180 1440,190 V300 H0 Z" />
                </svg>
            </div>}
        </div>
    );
};

export default BackgroundWaves;