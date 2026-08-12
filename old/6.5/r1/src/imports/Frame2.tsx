export default function Frame2() {
  return (
    <div className="bg-black relative size-full">
      <div className="absolute flex flex-col font-['Liter:Regular',_'Noto_Sans:Regular',_sans-serif] justify-center leading-[0] left-[100px] text-[52px] text-white top-[calc(50%+9px)] translate-y-[-50%] w-[385px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="font-['Advercase_Demo:Regular',_'Noto_Sans:Regular',_sans-serif] leading-[60px] mb-0" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          my name’s max
        </p>
        <p className="font-['Advercase_Demo:Regular',_'Noto_Sans:Regular',_sans-serif] leading-[60px] mb-0" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          i speak english
        </p>
        <p className="font-['Advercase_Demo:Regular',_'Noto_Sans:Regular',_sans-serif] leading-[60px] mb-0">
          <span style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>{`i make `}</span>
          <span className="[text-underline-position:from-font] decoration-solid text-[#ff5705] underline" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            software
          </span>
        </p>
        <p className="font-['Advercase_Demo:Regular',_'Noto_Sans:Regular',_sans-serif] leading-[60px]">
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid underline" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            telegram
          </span>
          <span style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}> </span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid underline" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            github
          </span>
        </p>
      </div>
    </div>
  );
}