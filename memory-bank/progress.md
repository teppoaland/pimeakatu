# 📊 Projektin edistyminen

> v3.x – 17.9.2026

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila |
|-----------|------|
| Katunäkymä, hahmo, lamput, ovet | ✅ |
| Kolikot (katu + pelit) | ✅ v3.86 – katu: kolikko jalkojen liikkuma-alalle (x 0–780, y 310–380), 120s respawn; DG1 1kpl, DG2 1/taso |
| Hampurilaiset (lives) + BAR | ✅ v3.73 – 5 alussa, 1/40s, BAR:sta lisää, dramaattinen kuolemasekvenssi |
| Taustamusiikki (MP3-looppi), äänet, CRT-teema | ✅ v3.85 – aito MP3-looppi (`running.mp3`), mobiilifiksit: autoplay-esto ei poista MP3:a pysyvästi + `synthGain`-mykistys estää MP3:n ja syntikan päällekkäin soimisen |
| Ajoneuvot, eläimet, sääefektit | ✅ |
| Mustat lehdettömät puut (isoimmat raot) | ✅ v3.82 – 2 kpl, siluetti, eri korkeus |
| Pienet ruohotupsut puiden juurella (1/4 koko) | ✅ v3.83 – 3 kpl per puu, random paikka raossa, huojuvat |
| Sähkökaappi (1. puun vieressä) | ✅ v3.90 – harmaa laatikko + vilkkuva keltainen valo; sähköisku vain seinää vasten (pää kaapin yläreunan yläpuolella), ei alhaalta, ei tekstiä |
| Kolikko potkusta talosta (1/5, 30s cooldown) | ✅ v3.93 – kukkaruukun sijaan 1/5 kolikko, 30s cooldown estää farmaamisen |
| Ajoneuvojen moottoriäänet (panoroiva surina) | ✅ v3.81 – mopo korkea, autot/ambulanssi matala, stereo-pannaus |
| Mobiiliohjaimet | ✅ |
| Mobiilikamera (vaakascrollaus pystymoodissa) | ✅ v3.91 – kosketuslaitteella zoom (täyttää korkeuden) + `camX` seuraa pelaajaa; PC: koko katu ennallaan |
| Lampun visuaalinen viimeistely | ✅ v3.96 – varren pyöreä gradientti + jalusta katukivetyksen rasterina, pystyraita vaihtelee oikealla/vasemmalla lampuittain |
| Teräsaidan alavaakarauta (vaihtelu) | ✅ v4.0 – pystysuuntainen pyöreä gradientti + niitit joka pystypiikin kohdalle, aiemmin tasainen #2e2e2e |
| Boulder Dash alkudialogi (vaakakuva) | ✅ v4.0 – #overlay-content max-height/overflow-y + @media (max-height: 500px) pienentää otsikon/tekstit, jotta ylä-/alakehykset mahtuvat |

## ⛏️ Dig Game (digGame1/) | 💎 Boulder Dash (digGame2/)

| Ominaisuus | Tila |
|-----------|------|
| Peruspelit (kaivu, fysiikka, viholliset) | ✅ |
| Äänet, kosketusohjaus, iframe | ✅ |
| Kolikot | ✅ v3.72 – DG1:1, DG2:4 (1/taso), hiljainen keräys |

## ✈️ Blue Max (bluemax_c64/)

| Ominaisuus | Tila |
|-----------|------|
| Blue Max: lento, taistelu, HUD | ✅ |

## 🛠️ Infrastruktuuri
`.clinerules/`, `memory-bank/`, Git – ✅

