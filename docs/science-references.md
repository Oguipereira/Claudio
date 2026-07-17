# Referências científicas do motor de insights

Este documento lista a base científica de cada análise automática gerada pelo
HYROX Performance OS (`src/domain/insights/`). O objetivo é que toda
recomendação ou alerta apresentado ao usuário possa ser rastreado até uma
fonte, e que as simplificações feitas fiquem explícitas em vez de implícitas.

## Carga de treino e risco de lesão

**Relação carga aguda:crônica (ACWR)** — Gabbett, T. J. (2016). *The
training—injury prevention paradox: should athletes be training smarter and
harder?* British Journal of Sports Medicine, 50(5), 273–280.

- Carga aguda = soma da carga de treino dos últimos 7 dias.
- Carga crônica = média semanal da carga de treino dos últimos 28 dias.
- Faixa "ótima": 0.8–1.3. Acima de 1.5: aumento significativo de risco de
  lesão. Abaixo de 0.8: possível destreino.
- **Simplificação assumida**: usamos a *duração da sessão em minutos* como
  métrica de carga ("carga externa", na terminologia de Gabbett), em vez do
  TRIMP de Banister (1991), que exige frequência cardíaca de repouso e
  frequência cardíaca máxima individualizadas — dados que o app não coleta de
  forma confiável para todas as sessões. Gabbett trata carga externa
  (duração, distância) como alternativa válida à carga interna (FC/RPE) para
  o cálculo do ACWR, então essa simplificação é sustentada pela própria
  literatura de origem, não uma aproximação arbitrária.

**Monotonia e strain** — Foster, C., et al. (2001). *A new approach to
monitoring exercise training.* Journal of Strength and Conditioning
Research, 15(1), 109–115.

- Monotonia = média da carga diária ÷ desvio-padrão da carga diária, na
  semana. Monotonia alta (≥ 2.0) indica pouca variação na carga (ex.: mesma
  intensidade todo dia), associada a maior incidência de doença/overtraining
  mesmo quando a carga total é moderada.
- Strain = carga semanal total × monotonia. Picos de strain, não somente a
  carga isolada, é o que mais se associa a lesão/doença em séries temporais
  de atletas monitorados.

## Sono e recuperação

**Sono e desempenho de resistência** — Fullagar, H. H. K., et al. (2015).
*Sleep and Athletic Performance: The Effects of Sleep Loss on Exercise
Performance, and Physiological and Cognitive Responses to Exercise.* Sports
Medicine, 45(2), 161–186.

- Base para a comparação de ritmo/FC de corrida entre noites com mais ou
  menos horas de sono (limiar de 7h, alinhado à recomendação geral de sono
  para adultos/atletas).
- **Simplificação assumida**: a comparação é descritiva (médias por grupo),
  não um teste estatístico formal — o volume de dados de um único atleta é
  pequeno demais para inferência robusta. O insight é apresentado como
  observação, não como conclusão causal.

**Recomendação geral de sono para adultos/atletas** — usada como linha de
referência (7h) nos gráficos de tendência de sono: Watson, A. M. (2017).
*Sleep and Athletic Performance.* Current Sports Medicine Reports, 16(6),
413–418 (posicionamento consolidado por múltiplas entidades, incluindo
National Sleep Foundation e literatura de medicina esportiva).

## Nutrição

**Necessidade de proteína para atletas combinando força e resistência** —
Jäger, R., et al. (2017). *International Society of Sports Nutrition
Position Stand: protein and exercise.* Journal of the International Society
of Sports Nutrition, 14, 20.

- Faixa recomendada: 1.6–2.2 g de proteína por kg de peso corporal por dia.
- O alerta de proteína baixa depende do usuário ter registrado o peso
  corporal (módulo de métricas corporais); sem esse dado, o insight
  simplesmente não é gerado — não assumimos um peso padrão.

**Disponibilidade energética / RED-S** — Loucks, A. B., & Thuma, J. R.
(2003). *Luteinizing hormone pulsatility is disrupted at a threshold of
energy availability in regularly menstruating women.* Journal of Clinical
Endocrinology & Metabolism, 88(1), 297–311; conceito popularizado como
Relative Energy Deficiency in Sport (RED-S) pelo IOC Consensus Statement
(Mountjoy et al., 2014/2018).

- Disponibilidade energética aproximada = (calorias consumidas − calorias
  gastas em treino) ÷ peso corporal (kg). Abaixo de ~30 kcal/kg é a faixa
  associada a risco de disponibilidade energética insuficiente na
  literatura.
- **Simplificação assumida**: o cálculo original usa massa livre de gordura
  (FFM), que o app não mede; usamos peso corporal total como aproximação,
  deixando o insight deliberadamente conservador (só dispara em casos bem
  abaixo do limiar).

## Periodização

**Blocos de periodização (base/construção/pico) e polimento (taper)** —
Bompa, T. O., & Buzzichelli, C. (2019). *Periodization: Theory and
Methodology of Training* (6th ed.), Human Kinetics; Matveyev, L. (1981)
*Fundamentals of Sports Training*; Mujika, I., & Padilla, S. (2003).
*Scientific bases for precompetition tapering strategies.* Medicine &
Science in Sports & Exercise, 35(7), 1182–1187.

- Classificação simplificada por semanas até a prova: base (> 16 semanas),
  construção (9–16), pico (3–8), polimento/taper (1–2), semana da prova (0).
  O taper reduz volume mantendo intensidade para dissipar fadiga acumulada
  preservando as adaptações de treino, conforme revisão de Mujika & Padilla.

## O que **não** é gerado sem dados suficientes

Por design, nenhum insight é exibido quando os dados necessários não
existem — o motor não extrapola nem assume valores padrão para preencher
lacunas (ex.: sem peso corporal registrado, não há alerta de proteína; sem
corridas suficientes nas últimas semanas, não há comparação de tendência de
ritmo). Isso é deliberado: preferimos silêncio a uma conclusão sem suporte
nos dados disponíveis.
