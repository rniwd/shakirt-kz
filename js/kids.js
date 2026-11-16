// Балалар суреті (SVG, фонсыз): қазақ ұлттық киімін киген ұл мен қыз арқан тартады.
// Сурет солға қарай тартатын команда үшін салынған; оң жақ команда айна бейнесімен көрсетіледі.
const Kids = (() => {
  const SKIN = "#f2bf98", HAIR = "#1b1b24", GOLD = "#f5b82e", GROUND = 232;
  const TH = -14 * Math.PI / 180; // артқа еңкею бұрышы

  // жергілікті нүктені (аяқ нүктесінен айналдырып) әлемдік координатаға аудару
  const rot = (fx, x, y) => {
    const dy = y - GROUND;
    return [fx + x * Math.cos(TH) - dy * Math.sin(TH), GROUND + x * Math.sin(TH) + dy * Math.cos(TH)];
  };
  const arm = (fx, color, hx, hy) => {
    const [sx, sy] = rot(fx, 6, 98);
    const mx = (sx + hx) / 2, my = (sy + hy) / 2 + 12;
    return `<path d="M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}" stroke="${color}" stroke-width="13" fill="none" stroke-linecap="round"/>
            <circle cx="${hx}" cy="${hy}" r="7.5" fill="${SKIN}"/>`;
  };

  // ---- Ұл: тақия, шапан, белбеу ----
  function boyBody(c, a) {
    return `
      <path d="M-5 150 L-36 227" stroke="#243b5a" stroke-width="19" stroke-linecap="round"/>
      <path d="M6 150 L28 190 L22 227" stroke="#243b5a" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <ellipse cx="-42" cy="231" rx="17" ry="7" fill="#5a3a1c"/><ellipse cx="29" cy="231" rx="17" ry="7" fill="#5a3a1c"/>
      <path d="M-26 90 Q0 80 26 90 L32 168 Q0 178 -32 168 Z" fill="${c}"/>
      <path d="M-26 90 Q0 80 26 90 L22 100 Q0 94 -22 100Z" fill="${a}" opacity=".95"/>
      <path d="M-32 160 Q0 170 32 160 L32 168 Q0 178 -32 168Z" fill="${a}"/>
      <rect x="-30" y="128" width="60" height="11" rx="3" fill="${a}"/>
      <path d="M-4 128h8v11h-8z" fill="#e23b3b"/>
      <path d="M0 96 L-8 128 M0 96 L8 128" stroke="${a}" stroke-width="3" fill="none"/>
      <rect x="-5" y="76" width="14" height="14" rx="5" fill="${SKIN}"/>
      <path d="M-20 58 Q-22 40 2 38 Q-6 58 -20 58Z" fill="${HAIR}"/>
      <circle cx="3" cy="61" r="23" fill="${SKIN}"/>
      <circle cx="-19" cy="63" r="5" fill="${SKIN}"/>
      <path d="M-21 54 Q3 14 27 54Z" fill="#d63a45"/>
      <rect x="-22" y="49" width="50" height="9" rx="4" fill="#fff"/>
      <path d="M-14 53l4-3 4 3-4 3zM-2 53l4-3 4 3-4 3zM10 53l4-3 4 3-4 3z" fill="${a}"/>
      <circle cx="3" cy="31" r="3.5" fill="${a}"/>
      <ellipse cx="13" cy="62" rx="2.6" ry="3" fill="#1d1d28"/>
      <path d="M7 70 Q14 79 21 69 Q14 72 7 70Z" fill="#a23b3b"/>
      <circle cx="19" cy="68" r="4" fill="#f59a8d" opacity=".55"/>`;
  }
  // ---- Қыз: сәукеле үлгісіндегі бөрік, көйлек, өрілген шаш ----
  function girlBody(c, a) {
    return `
      <path d="M-5 160 L-36 227" stroke="#fff" stroke-width="15" stroke-linecap="round" opacity=".9"/>
      <path d="M6 160 L28 192 L22 227" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>
      <ellipse cx="-42" cy="231" rx="16" ry="7" fill="#7a2230"/><ellipse cx="29" cy="231" rx="16" ry="7" fill="#7a2230"/>
      <path d="M-22 90 Q0 82 22 90 L26 130 L46 190 Q0 202 -46 190 L-26 130Z" fill="${c}"/>
      <path d="M-46 190 Q0 202 46 190 L45 183 Q0 195 -45 183Z" fill="${a}"/>
      <path d="M-30 164 Q0 174 33 164" stroke="${a}" stroke-width="5" fill="none"/>
      <path d="M-22 90 Q0 82 22 90 L20 134 Q0 140 -20 134Z" fill="${a}" opacity=".9"/>
      <path d="M-4 100l4-4 4 4-4 4zM-4 114l4-4 4 4-4 4z" fill="#fff"/>
      <path d="M-12 62 Q-30 90 -32 124" stroke="${HAIR}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M-4 66 Q-22 96 -22 128" stroke="${HAIR}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="-32" cy="126" r="5" fill="#e23b3b"/><circle cx="-22" cy="130" r="5" fill="#e23b3b"/>
      <rect x="-5" y="78" width="13" height="13" rx="5" fill="${SKIN}"/>
      <circle cx="3" cy="62" r="22" fill="${SKIN}"/>
      <path d="M-19 56 Q3 20 25 56Z" fill="#b6203a"/>
      <rect x="-20" y="50" width="46" height="9" rx="4" fill="${a}"/>
      <circle cx="-8" cy="54" r="2.2" fill="#fff"/><circle cx="3" cy="54" r="2.2" fill="#fff"/><circle cx="14" cy="54" r="2.2" fill="#fff"/>
      <path d="M2 30 Q-6 6 10 -4 Q8 14 6 30Z" fill="#fff" stroke="#d7e0e6" stroke-width="1.5"/>
      <ellipse cx="13" cy="63" rx="2.6" ry="3" fill="#1d1d28"/>
      <path d="M7 71 Q14 79 20 70 Q14 73 7 71Z" fill="#a23b3b"/>
      <circle cx="19" cy="69" r="4" fill="#f59a8d" opacity=".6"/>`;
  }

  // Команда: [қыз, ұл] — бір-бірінің артында, арқанды ұстап тұр. viewBox 300×240.
  function team(main, accent) {
    const gx = 118, bx = 238, ropeY = 100;
    const grp = (fx, body) => `<g transform="translate(${fx},0) rotate(-14 0 ${GROUND})">${body}</g>`;
    return `<svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${grp(gx, girlBody(main, accent))}
      ${grp(bx, boyBody(main, accent))}
      <line x1="44" y1="${ropeY}" x2="300" y2="${ropeY}" stroke="#b8863b" stroke-width="9" stroke-linecap="round"/>
      <line x1="44" y1="${ropeY}" x2="300" y2="${ropeY}" stroke="#7d5a22" stroke-width="9" stroke-dasharray="3 7"/>
      ${arm(gx, main, rot(gx, 6, 98)[0] + 62, ropeY)}${arm(gx, main, rot(gx, 6, 98)[0] + 50, ropeY + 3)}
      ${arm(bx, main, rot(bx, 6, 98)[0] + 62, ropeY)}${arm(bx, main, rot(bx, 6, 98)[0] + 50, ropeY + 3)}
    </svg>`;
  }
  return { team };
})();
