import {
  ALLOS_INST, ALLOS_REP,
  sec, p, center, sigBlock, ul, esc, docHeader,
  valorPorExtenso, mesesPorExtenso, dataExtenso, dataBR,
} from "../core.js";

/* ════════════════════════════════════════════
   DOCUMENTOS DA ÁREA DE ESTÁGIOS
   — Termo de Compromisso de Estágio (Lei 11.788/2008)
   — Contrato de Prestação de Serviços
   — Modelos de e-mail para as faculdades
   ════════════════════════════════════════════ */

/* Marcador de campo não preenchido: aparece no papel para que
   ninguém assine um contrato com lacuna despercebida. */
const falta = (rotulo) => `<span style="background:#FBEDE7;color:#B85A40;">[${rotulo}]</span>`;
const v = (valor, rotulo) => {
  const s = String(valor ?? "").trim();
  return s ? esc(s) : falta(rotulo);
};

const ORDINAIS = ["PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA",
  "SEXTA", "SÉTIMA", "OITAVA", "NONA", "DÉCIMA"];

/** Monta "Rua X, nº 1, bairro Y, cidade/UF, CEP 00000-000" a partir do cadastro. */
function enderecoDe(r) {
  const partes = [
    r.logradouro,
    r.bairro && `bairro ${r.bairro}`,
    [r.cidade, r.uf].filter(Boolean).join("/"),
    r.cep && `CEP ${r.cep}`,
  ].filter(x => x && String(x).trim());
  return partes.length ? esc(partes.join(", ")) : falta("endereço");
}

/** Qualificação civil comum a estagiários e prestadores. */
function qualificacao(r, { profissao } = {}) {
  const bits = [
    v(r.nacionalidade, "nacionalidade"),
    v(r.estadoCivil, "estado civil"),
    profissao || "estudante",
    `inscrito(a) no CPF sob o nº ${v(r.cpf, "CPF")}`,
    `portador(a) do Documento de Identidade nº ${v(r.rg, "RG")}, expedido por ${v(r.rgOrgao, "órgão expedidor")}`,
    `residente e domiciliado(a) em ${enderecoDe(r)}`,
    `e-mail: ${v(r.email, "e-mail")}`,
  ];
  return bits.join(", ");
}

/** Bloco de qualificação da Allos, idêntico nos dois instrumentos. */
function blocoAllos(papel) {
  return p(`<b>${ALLOS_INST.nome}</b> (“${papel}”), pessoa jurídica de direito privado, constituída e organizada sob a forma de associação civil com objetivos não econômicos e sem fins lucrativos, inscrita no CNPJ sob o nº ${ALLOS_INST.cnpj}, com sede na ${ALLOS_INST.endereco}; neste ato representada na forma de seu estatuto social, por seu ${ALLOS_REP.cargo}, <b>${ALLOS_REP.nome}</b>, ${ALLOS_REP.qualificacao}, inscrito no CPF sob o nº ${ALLOS_REP.cpf}, portador do Documento de Identidade nº ${ALLOS_REP.rg}, expedido pela ${ALLOS_REP.rgOrgao}, residente e domiciliado na ${ALLOS_REP.endereco}, e-mail: ${ALLOS_REP.email}.`);
}

/* ════════════════════════════════════════════
   TERMO DE COMPROMISSO DE ESTÁGIO
   ════════════════════════════════════════════ */
export function renderTCE({ est = {}, sup = null, fac = null }) {
  const bolsaExt = est.bolsa ? valorPorExtenso(est.bolsa) : "";
  const mesesExt = est.duracaoMeses ? mesesPorExtenso(est.duracaoMeses) : "";
  const cargaFac = (fac && fac.cargaHoraria) || est.cargaHoraria || "30 (trinta) horas semanais";
  const nomeFac = fac ? (fac.nome || fac.sigla) : "";

  /* A numeração das cláusulas acompanha o que a faculdade exige:
     as cláusulas específicas dela entram antes do foro. */
  const temEspecificas = !!(fac && fac.clausulas && fac.clausulas.trim());
  let n = 0;
  const prox = () => ORDINAIS[n++];

  const cEstagio = prox(), cPrazo = prox(), cConcedente = prox(),
    cEstagiario = prox(), cRescisao = prox();
  const cEspecificas = temEspecificas ? prox() : null;
  const cForo = prox();

  /* ── Instituição de ensino ── */
  const blocoFaculdade = fac
    ? p(`<b>${esc(fac.nome || fac.sigla)}</b> (“INSTITUIÇÃO DE ENSINO”), inscrita no CNPJ sob o nº ${v(fac.cnpj, "CNPJ da faculdade")}, com sede em ${[fac.endereco, fac.cidade, fac.cep && `CEP ${fac.cep}`].filter(Boolean).map(esc).join(", ") || falta("endereço da faculdade")}, interveniente-anuente neste ato.`)
    : p(`<b>${falta("INSTITUIÇÃO DE ENSINO")}</b> (“INSTITUIÇÃO DE ENSINO”), interveniente-anuente neste ato.`);

  /* ── Supervisor(a) ── */
  const linhaSupervisor = sup
    ? `Fornecer um orientador, com CRP ativo, que assumirá o compromisso de acompanhamento das atividades a serem desenvolvidas pelo ESTAGIÁRIO. A saber, <b>${esc(sup.nome)}</b>, formado(a) em Psicologia pela ${v(sup.formacao, "faculdade do supervisor")}, inscrito(a) no CRP sob o nº ${v(sup.crp, "CRP")}.`
    : `Fornecer um orientador, com CRP ativo, que assumirá o compromisso de acompanhamento das atividades a serem desenvolvidas pelo ESTAGIÁRIO. A saber, ${falta("supervisor(a) não vinculado(a)")}.`;

  /* ── Cláusulas específicas da faculdade (texto livre do cadastro) ── */
  const secEspecificas = temEspecificas ? `
${sec(`CLÁUSULA ${cEspecificas} — DISPOSIÇÕES ESPECÍFICAS DA INSTITUIÇÃO DE ENSINO`)}

${String(fac.clausulas).split(/\n\s*\n/).map(b => p(esc(b.trim()).replace(/\n/g, "<br/>"))).join("")}
` : "";

  /* ── Assinaturas ── */
  const assinaturas = [
    sigBlock([
      { text: ALLOS_INST.nome, bold: true },
      { text: "CONCEDENTE" },
      { text: `Representada pelo ${ALLOS_REP.cargo}: ${ALLOS_REP.nomeCap}` },
    ]),
    sigBlock([
      { text: est.nome ? esc(est.nome).toUpperCase() : falta("NOME DO ESTAGIÁRIO"), bold: true },
      { text: "ESTAGIÁRIO(A)" },
      { text: `CPF ${v(est.cpf, "CPF")}` },
    ]),
    sigBlock([
      { text: nomeFac ? esc(nomeFac).toUpperCase() : falta("INSTITUIÇÃO DE ENSINO"), bold: true },
      { text: "INSTITUIÇÃO DE ENSINO" },
    ]),
  ];

  if (fac && fac.exigeOrientador) {
    assinaturas.push(sigBlock([
      { text: est.profOrientador ? esc(est.profOrientador).toUpperCase() : falta("PROFESSOR(A) ORIENTADOR(A)"), bold: true },
      { text: "PROFESSOR(A) ORIENTADOR(A)" },
    ]));
  }

  const exigeTest = !fac || fac.exigeTestemunhas !== false;
  const testemunhas = exigeTest ? `
${sec("TESTEMUNHAS")}
${sigBlock([{ text: "Nome:" }, { text: "CPF:" }])}
${sigBlock([{ text: "Nome:" }, { text: "CPF:" }])}
` : "";

  /* ── Anexo: plano de atividades ── */
  const anexo = (fac && fac.exigePlano) ? `
<div style="page-break-before:always;"></div>
${sec("ANEXO I — PLANO DE ATIVIDADES DE ESTÁGIO")}

${p(`<b>Estagiário(a):</b> ${v(est.nome, "nome")} &nbsp;·&nbsp; <b>Instituição de ensino:</b> ${nomeFac ? esc(nomeFac) : falta("faculdade")}`)}

${p(`<b>Supervisor(a) responsável:</b> ${sup ? esc(sup.nome) : falta("supervisor(a)")}${sup && sup.crp ? ` — CRP ${esc(sup.crp)}` : ""}`)}

${p(`<b>Carga horária:</b> ${esc(cargaFac)} &nbsp;·&nbsp; <b>Período:</b> ${est.dataInicio ? dataBR(est.dataInicio) : falta("início")} a ${est.dataFim ? dataBR(est.dataFim) : falta("término")}`)}

${p("<b>Atividades previstas:</b>")}

${ul([
    "Atendimento psicológico presencial ou remoto, individual ou em grupo, sob supervisão;",
    "Participação nas diferentes modalidades de supervisão, em carga horária condizente com as horas destinadas ao atendimento;",
    "Elaboração e cumprimento do Plano de Estudo e Expectativas;",
    "Registro de atendimentos e elaboração de documentos técnicos, sob orientação do(a) supervisor(a);",
    "Participação nas atividades da CONCEDENTE ligadas à clínica, clínica social, pesquisa e divulgação científica;",
    "Participação, organização e auxílio em setores, núcleos e polos.",
  ])}

${p("<b>Objetivos de aprendizagem:</b> desenvolver competências de escuta clínica, manejo do enquadre, raciocínio clínico e redação de documentos psicológicos, em conformidade com o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005) e com o projeto pedagógico do curso.")}

${p("<b>Forma de acompanhamento e avaliação:</b> supervisão regular conduzida por psicólogo(a) com registro ativo, com avaliação periódica do desempenho e emissão de relatório de atividades sempre que solicitado pela INSTITUIÇÃO DE ENSINO.")}
` : "";

  return `
${docHeader("TERMO DE COMPROMISSO DE ESTÁGIO NÃO OBRIGATÓRIO",
    nomeFac ? esc(nomeFac) : "Lei nº 11.788/2008")}

${sec("DAS PARTES")}

${p("De um lado:")}

${blocoAllos("CONCEDENTE")}

${p("E, de outro lado:")}

${p(`<b>${est.nome ? esc(est.nome).toUpperCase() : falta("NOME DO ESTAGIÁRIO")}</b> (“ESTAGIÁRIO”), ${qualificacao(est)}; graduando(a) em Psicologia na ${nomeFac ? esc(nomeFac) : falta("faculdade")}${est.periodo ? `, ${esc(est.periodo)}` : ""}.`)}

${p("E, como interveniente-anuente:")}

${blocoFaculdade}

${p("CONCEDENTE, ESTAGIÁRIO e INSTITUIÇÃO DE ENSINO em conjunto denominados simplesmente \"PARTES\" e, isoladamente, \"PARTE\"; CONSIDERANDO QUE:")}

${p("A CONCEDENTE deseja firmar o presente Termo de Compromisso de Estágio, sem vínculo empregatício, visando o aperfeiçoamento profissional do ESTAGIÁRIO;")}

${p("O ESTAGIÁRIO deseja realizar estágio na área de psicologia visando aprimorar seu conhecimento profissional de acordo com este instrumento; e")}

${p("As PARTES desejam regularizar tal situação por meio deste instrumento, segundo as disposições legais da Lei nº 11.788/2008, que regulamenta a contratação de estagiários.")}

${p("RESOLVEM de mútuo e comum acordo, celebrar o presente Termo de Compromisso de Estágio (doravante denominado simplesmente \"Termo\"), que se regerá pelas seguintes cláusulas e condições:")}

${sec(`CLÁUSULA ${cEstagio} — DO ESTÁGIO`)}

${p("1.1. O presente Termo de Compromisso de Estágio estabelece as condições básicas para a consecução de estágio, visando o exercício prático da atividade profissional e à contextualização curricular, objetivando o desenvolvimento do ESTAGIÁRIO para a vida e para o trabalho, proporcionadas pela aprendizagem social, profissional e cultural do ambiente de trabalho.")}

${p("1.2. O ESTAGIÁRIO não terá, para qualquer efeito, vínculo empregatício com a CONCEDENTE.")}

${p(`1.3. O ESTAGIÁRIO receberá mensalmente, a título de bolsa base de complementação educacional, a importância de R$ ${v(est.bolsa, "valor da bolsa")}${bolsaExt ? ` (${bolsaExt} reais)` : ""}, que será paga até o 10º dia útil do mês subsequente ao da realização do estágio, com caráter contraprestativo pelas atividades desenvolvidas no estágio.`)}

${p(`1.4. Além da bolsa de complementação educacional prevista na Cláusula 1.3 do presente Termo, o ESTAGIÁRIO receberá auxílio-transporte${est.auxTransporte ? ` no valor de R$ ${esc(est.auxTransporte)}` : ", quando necessário,"} que será pago até o 10º dia útil do mês subsequente ao da realização do estágio.`)}

${p("1.5. Além da bolsa base, prevista na Cláusula 1.3, e do auxílio-transporte previsto na Cláusula 1.4, o ESTAGIÁRIO pode ou não receber um adicional de desempenho com base no mês anterior.")}

${p(`1.6. O horário prioritário do estágio será de ${v(est.horario, "horário")}, mas fica a critério do ESTAGIÁRIO flexibilizar conforme sua preferência, respeitando-se, obrigatoriamente, o limite legal de 6 (seis) horas diárias, totalizando ${esc(cargaFac)}, bem como o turno regular das aulas no qual o estagiário esteja matriculado, os horários de realização de provas e de outros trabalhos didáticos, além das limitações dos meios de transporte vivenciados pelo ESTAGIÁRIO.`)}

${sec(`CLÁUSULA ${cPrazo} — DO PRAZO`)}

${p(`2.1. O estágio inicia-se em ${est.dataInicio ? dataExtenso(est.dataInicio) : falta("data de início")} e terá duração de ${v(est.duracaoMeses, "duração")}${mesesExt ? ` (${mesesExt})` : ""} meses, encerrando-se em ${est.dataFim ? dataExtenso(est.dataFim) : falta("data de término")}, podendo ser prorrogado por iguais períodos até o máximo de 24 (vinte e quatro) meses.`)}

${sec(`CLÁUSULA ${cConcedente} — DAS OBRIGAÇÕES DA CONCEDENTE`)}

${p("3.1. A CONCEDENTE se obriga a:")}

${ul([
    "Proporcionar ao ESTAGIÁRIO a experiência prática, especificamente na área de concentração em Psicologia, favorecendo a sua integração, aperfeiçoamento técnico, cultural, científico e de relacionamento humano;",
    "Efetuar controle de assiduidade do estagiário;",
    "Efetuar o pagamento da bolsa no prazo previsto neste Termo e no sistema B.E.M.;",
    "Conceder férias de 30 (trinta) dias anuais, conforme disposto na Lei de Estágio, preferencialmente no período de férias escolares, ou proporcionalmente de acordo com o período de vigência do estágio;",
    linhaSupervisor,
    `Providenciar o Seguro de acidentes pessoais, previsto no art. 9º da Lei nº 11.788/2008, coberto pela apólice nº ${v(est.apolice, "nº da apólice")} da seguradora ${v(est.seguradora, "seguradora")}, em favor do ESTAGIÁRIO.`,
  ])}

${sec(`CLÁUSULA ${cEstagiario} — DAS OBRIGAÇÕES DO ESTAGIÁRIO`)}

${p("4.1. O ESTAGIÁRIO se obriga a cumprir as normas internas as quais declara conhecer, carregar os valores e zelar pela imagem da CONCEDENTE, bem como a cumprir a programação do estágio, respondendo por perdas e danos consequentes de inobservância das mesmas, observadas as seguintes atividades:")}

${ul([
    "Atendimento psicológico presencial ou remoto, individual ou em grupo;",
    "Participação nas diferentes modalidades de supervisão em quantidade de horas condizente com as horas destinadas a atendimento;",
    "Cumprimento do Plano de Estudo e Expectativas;",
    "Participação nas atividades da CONCEDENTE ligadas à clínica, clínica social, pesquisa e divulgação científica; e",
    "Participação, organização e auxílio em setores, núcleos e polos.",
  ])}

${p("4.2. O ESTAGIÁRIO compromete-se, formalmente, a manter sigilo sobre informações, dados ou trabalhos reservados acerca dos clientes da CONCEDENTE aos quais tenha acesso, na forma do Código de Ética Profissional do Psicólogo.")}

${p("4.3. O ESTAGIÁRIO se obriga, sempre que solicitado, a elaborar relatório circunstanciado sobre as atividades realizadas, entregando-o à CONCEDENTE na data fixada por esta.")}

${p("4.4. O ESTAGIÁRIO deverá apresentar à CONCEDENTE, ao final do estágio, e sempre que solicitado por esta, relatório sobre o trabalho por ele realizado.")}

${sec(`CLÁUSULA ${cRescisao} — DA RESCISÃO`)}

${p("5.1. A inobservância, pelo ESTAGIÁRIO, das cláusulas e condições convencionadas no presente Termo facultará à CONCEDENTE considerá-lo rescindido, mediante comunicação por escrito, que produzirá efeitos imediatos. O presente Termo de Compromisso ficará automaticamente rescindido nas seguintes hipóteses:")}

${ul([
    "Forem atribuídas ao ESTAGIÁRIO condutas incompatíveis com sua formação acadêmica ou com as atividades desenvolvidas nas dependências da CONCEDENTE, estranhas ao Estágio Curricular e Profissional, de modo a caracterizar eventual vínculo empregatício entre as PARTES supracitadas;",
    "Término do prazo do Termo de Compromisso, em caso de não extensão;",
    "Na ocasião da colação de grau do ESTAGIÁRIO;",
    "Não comparecimento do ESTAGIÁRIO ao estágio por período superior a 5 (cinco) dias, sem justificativa considerada plausível pela CONCEDENTE, que, de qualquer forma, deverá ser previamente comunicada e anuir com o não comparecimento do ESTAGIÁRIO no período que vier a ser acordado; e",
    "Se o ESTAGIÁRIO concluir o curso, abandoná-lo ou trancar a matrícula durante o estágio.",
  ])}

${p("5.2. Em qualquer tempo, as PARTES poderão rescindir o presente Termo, bastando, para tanto, a comunicação por escrito do interessado.")}
${secEspecificas}
${sec(`CLÁUSULA ${cForo} — DO FORO`)}

${p(`${temEspecificas ? "7.1" : "6.1"}. Fica eleito o foro da ${ALLOS_INST.foro} para dirimir quaisquer questões tendo por objeto o presente Termo.`)}

${p(`E, por estarem assim justas e contratadas, as PARTES celebram este Termo em ${exigeTest ? "3 (três) vias físicas, de igual teor e forma, perante as 2 (duas) testemunhas abaixo." : "3 (três) vias físicas, de igual teor e forma."}`)}

${center(`${ALLOS_INST.cidade}, ${est.tceData ? dataExtenso(est.tceData) : falta("data de assinatura")}.`)}

<div style="margin-top:28pt;"></div>

${assinaturas.join("")}
${testemunhas}
${anexo}
`;
}

/* ════════════════════════════════════════════
   CONTRATO DE PRESTAÇÃO DE SERVIÇOS
   ════════════════════════════════════════════ */
export function renderPrestacao({ pr = {} }) {
  const valorExt = pr.valor ? valorPorExtenso(pr.valor) : "";
  const escopoPadrao = "Os serviços poderão incluir, entre outros: atendimentos presenciais ou remotos, produção e organização de conteúdos, participação em eventos, reuniões, formações, apoio a projetos, suporte a equipes, registro de atividades e demais funções compatíveis com a formação, habilidades e experiência da CONTRATADA.";
  const escopo = (pr.escopo && pr.escopo.trim())
    ? esc(pr.escopo.trim()).replace(/\n/g, "<br/>")
    : escopoPadrao;

  return `
${docHeader("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", pr.funcao ? esc(pr.funcao) : "")}

${sec("DAS PARTES")}

${p("De um lado:")}

${blocoAllos("CONTRATANTE")}

${p("E, de outro lado:")}

${p(`<b>${pr.nome ? esc(pr.nome).toUpperCase() : falta("NOME DO CONTRATADO")}</b> (“CONTRATADA”), ${qualificacao(pr, { profissao: pr.profissao ? esc(pr.profissao) : falta("profissão") })}.`)}

${sec("CLÁUSULA PRIMEIRA — DO OBJETO")}

${p("1.1. O presente contrato tem por objeto a prestação de serviços profissionais especializados, de natureza lícita, por parte da CONTRATADA, nas áreas de apoio técnico, educacional, administrativo, operacional e/ou institucional, conforme as necessidades da CONTRATANTE.")}

${p(`1.2. ${escopo}`)}

${p("1.3. A CONTRATANTE poderá, mediante prévio acordo e aceite expresso da CONTRATADA, propor ajustes pontuais nas atividades originalmente previstas, respeitando as disposições legais e os limites físicos, técnicos e intelectuais da prestadora. Fica expressamente estabelecido que tais ajustes não implicarão subordinação hierárquica nem interferência direta na autonomia técnica ou operacional da CONTRATADA, sendo esta livre para aceitar ou recusar tais alterações, desde que mantido o escopo geral contratado.")}

${sec("CLÁUSULA SEGUNDA — DAS OBRIGAÇÕES DA CONTRATANTE")}

${p("2.1. A CONTRATANTE se obriga a fornecer, de forma clara, adequada e tempestiva, todas as informações, documentos, instruções e orientações necessárias à boa execução dos serviços contratados, devendo especificar os objetivos e parâmetros relevantes para o desempenho das atividades pela CONTRATADA.")}

${p("2.2. Sempre que aplicável, a CONTRATANTE deverá disponibilizar os meios e recursos mínimos necessários à realização dos serviços, tais como: acesso a sistemas, plataformas, agendas, canais internos de comunicação, materiais institucionais e/ou contato com demais membros de sua equipe, respeitando a natureza remota ou presencial das atividades envolvidas.")}

${p("2.3. A CONTRATANTE compromete-se a efetuar o pagamento da remuneração acordada nos prazos e condições estabelecidos na Cláusula Quinta deste contrato, respondendo por eventuais encargos em caso de atraso injustificado.")}

${sec("CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DA CONTRATADA")}

${p("3.1. A CONTRATADA compromete-se a prestar os serviços contratados de forma ética, diligente e qualificada, observando as diretrizes gerais acordadas entre as partes, respeitada sua autonomia técnica e operacional, bem como os limites técnicos e prazos previamente definidos em comum acordo.")}

${p("3.2. A CONTRATADA compromete-se a manter absoluto sigilo, durante a vigência deste contrato, sobre todas as informações, documentos, materiais, estratégias, dados ou operações da CONTRATANTE a que tiver acesso em razão da prestação dos serviços, utilizando-os exclusivamente para os fins diretamente relacionados à execução contratual. Após o término do contrato, a CONTRATADA continuará obrigada a preservar a confidencialidade das referidas informações, ficando expressamente vedada a sua utilização ou divulgação, sob qualquer forma, salvo mediante autorização expressa e por escrito da CONTRATANTE, ou por força de obrigação legal.")}

${p("3.3. A utilização de quaisquer dados, documentos ou materiais da CONTRATANTE, ou de terceiros com os quais esta se relacione, será restrita à finalidade contratual, sendo vedada a sua comercialização, reprodução ou uso para fins diversos daqueles estritamente necessários à prestação dos serviços.")}

${p("3.4. A CONTRATADA é integralmente responsável pelo cumprimento de suas obrigações de natureza trabalhista, previdenciária, fiscal e tributária decorrentes da execução dos serviços previstos neste contrato, inclusive no que se refere a profissionais eventualmente contratados por ela. A CONTRATANTE não responde, solidária ou subsidiariamente, por qualquer encargo decorrente da relação entre a CONTRATADA e seus colaboradores ou terceiros.")}

${p("3.5. A CONTRATADA deverá fornecer à CONTRATANTE os respectivos documentos fiscais ou recibos de pagamento equivalentes, válidos legalmente, como condição para a liberação dos valores devidos.")}

${sec("CLÁUSULA QUARTA — DOS SERVIÇOS")}

${p("4.1. A CONTRATADA atuará nos serviços contratados conforme o escopo geral previsto neste contrato, podendo as atividades específicas ser ajustadas ao longo da execução, respeitados os limites técnicos, éticos e funcionais da CONTRATADA.")}

${p(`4.2. Os serviços terão início em ${pr.dataInicio ? dataExtenso(pr.dataInicio) : "até 5 (cinco) dias úteis contados da assinatura deste contrato"}, salvo se as partes pactuarem formalmente outro prazo.`)}

${sec("CLÁUSULA QUINTA — DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO")}

${p(`5.1. A CONTRATANTE pagará à CONTRATADA, a título de remuneração pelos serviços prestados, o valor ${esc(pr.periodicidade || "mensal")} de R$ ${v(pr.valor, "valor")}${valorExt ? ` (${valorExt} reais)` : ""}, cujos critérios de aferição são previamente estabelecidos por comum acordo entre as partes. Fica expressamente ajustado que tais critérios não configuram controle de jornada nem subordinação hierárquica, permanecendo garantidas à CONTRATADA autonomia técnica, flexibilidade de horários para execução das atividades e ausência de exclusividade.`)}

${p("5.2. O pagamento será efetuado até o décimo (10º) dia útil do mês subsequente à prestação dos serviços, mediante apresentação de documento fiscal ou recibo equivalente emitido pela CONTRATADA.")}

${p("5.3. Em caso de atraso superior a 10 (dez) dias no pagamento, incidirá sobre o valor devido uma multa moratória de 2% (dois por cento), além de correção monetária com base no índice IPCA e juros de mora de 1% (um por cento) ao mês, até a data do efetivo pagamento.")}

${p("5.4. Considera-se cumprido o contrato, a cada período de competência, o conjunto de atividades executadas pela CONTRATADA e validado pela CONTRATANTE, conforme a natureza das tarefas desempenhadas.")}

${sec("CLÁUSULA SEXTA — DO DESCUMPRIMENTO")}

${p("6.1. O descumprimento de qualquer cláusula ou obrigação assumida neste contrato, por qualquer das partes, facultará à parte prejudicada a rescisão imediata do contrato, mediante notificação por escrito, sem prejuízo da cobrança de valores vencidos e de eventual indenização por perdas e danos, quando cabível.")}

${p("6.2. Excetuadas as hipóteses previstas na Cláusula Oitava, em caso de descumprimento contratual considerado grave ou injustificado, poderá ser aplicada à parte infratora multa compensatória equivalente a 10% (dez por cento) do valor estimado do contrato no período de sua vigência ou do valor mensal acordado, conforme a natureza do descumprimento e os prejuízos causados.")}

${p("6.3. A aplicação da multa não impede a adoção de outras medidas legais cabíveis, inclusive judiciais, nem isenta a parte infratora do dever de reparar integralmente os danos causados à outra parte.")}

${sec("CLÁUSULA SÉTIMA — DO PRAZO E VALIDADE")}

${p("7.1. A CONTRATADA realizará os serviços observando os prazos acordados entre as partes ou definidos por comunicação formal prévia, mantendo autonomia técnica e liberdade para gerir o cronograma das atividades contratadas. Caso identifique eventual impossibilidade de cumprimento dos prazos inicialmente previstos, comunicará formalmente a CONTRATANTE, apresentando nova estimativa de prazo, cuja aceitação dependerá do acordo mútuo entre as partes, respeitada sempre a avaliação técnica da CONTRATADA.")}

${p("7.2. Este contrato é celebrado para prestação de serviços específicos, sem caráter de exclusividade ou habitualidade, vigorando pelo período necessário à realização dos resultados pactuados. O contrato poderá ser encerrado antecipadamente por qualquer das partes, conforme previsto na cláusula de rescisão. A extinção deste instrumento não exonera as partes das obrigações éticas assumidas, especialmente aquelas relativas à confidencialidade, que permanecerão vigentes mesmo após o término contratual.")}

${sec("CLÁUSULA OITAVA — DA RESCISÃO IMOTIVADA")}

${p("8.1. O presente contrato poderá ser rescindido, a qualquer tempo e sem necessidade de justificativa, por iniciativa de qualquer das partes, mediante comunicação por escrito com antecedência mínima de 7 (sete) dias.")}

${p("8.2. Nessa hipótese, as partes comprometem-se a finalizar as atividades em curso de forma responsável e cooperativa, e a CONTRATANTE deverá efetuar o pagamento proporcional pelos serviços já prestados até a data de encerramento, incluindo os valores validados em sistema próprio, se aplicável.")}

${p("8.3. A rescisão unilateral e imotivada prevista nesta cláusula não configura descumprimento contratual e não enseja a aplicação de qualquer penalidade, multa ou indenização adicional, exceto pelo pagamento proporcional dos serviços efetivamente prestados.")}

${sec("CLÁUSULA NONA — DA OBSERVÂNCIA À LGPD")}

${p("9.1. A CONTRATANTE declara estar ciente de que a CONTRATADA poderá coletar, armazenar, tratar e compartilhar dados pessoais estritamente necessários à execução do presente contrato, com fundamento no artigo 7º, incisos II e V, da Lei nº 13.709/2018 (LGPD), incluindo dados para cumprimento de obrigações legais e para fins de proteção do crédito, quando aplicável.")}

${p("9.2. A CONTRATADA compromete-se a adotar medidas de segurança, técnicas e administrativas aptas a proteger os dados pessoais tratados no âmbito da execução contratual, em conformidade com os princípios da LGPD.")}

${p("9.3. Caso seja necessária a coleta de outros dados pessoais não diretamente vinculados à execução do contrato, será solicitado consentimento específico da parte titular, mediante documento próprio e transparente.")}

${p("9.4. As obrigações de sigilo e proteção de dados permanecerão válidas mesmo após o encerramento deste contrato, pelo prazo necessário ao cumprimento de obrigações legais e contratuais.")}

${sec("CLÁUSULA DÉCIMA — DAS DISPOSIÇÕES GERAIS")}

${p("10.1. Fica pactuada a total inexistência de vínculo trabalhista entre as partes, excluindo as obrigações previdenciárias e os encargos sociais, não havendo entre CONTRATADA e CONTRATANTE qualquer tipo de relação de subordinação.")}

${p("10.2. A contratação da CONTRATADA, cumpridas todas as formalidades legais, com ou sem exclusividade, de forma contínua ou não, afasta a qualidade de empregado prevista no art. 3º da CLT, nos termos do art. 442-B da CLT.")}

${p("10.3. A tolerância, por qualquer das partes, com relação ao descumprimento de qualquer termo ou condição aqui ajustado não será considerada como desistência em exigir o cumprimento de disposição nele contida, nem representará novação com relação à obrigação passada, presente ou futura, no tocante ao termo ou condição cujo descumprimento foi tolerado.")}

${sec("CLÁUSULA DÉCIMA PRIMEIRA — DO FORO")}

${p(`11.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da ${ALLOS_INST.foro}.`)}

${p("Por estarem assim justos e de acordo, firmam o presente instrumento, em duas vias de igual teor, juntamente com 2 (duas) testemunhas.")}

${center(`${ALLOS_INST.cidade}, ${pr.contratoData ? dataExtenso(pr.contratoData) : falta("data de assinatura")}.`)}

<div style="margin-top:28pt;"></div>

${sigBlock([
    { text: ALLOS_INST.nome, bold: true },
    { text: "CONTRATANTE" },
    { text: `Representada pelo ${ALLOS_REP.cargo}: ${ALLOS_REP.nomeCap}` },
  ])}

${sigBlock([
    { text: pr.nome ? esc(pr.nome).toUpperCase() : falta("NOME DO CONTRATADO"), bold: true },
    { text: "CONTRATADA" },
    { text: `CPF ${v(pr.cpf, "CPF")}` },
  ])}

${sec("TESTEMUNHAS")}
${sigBlock([{ text: "Nome:" }, { text: "CPF:" }])}
${sigBlock([{ text: "Nome:" }, { text: "CPF:" }])}
`;
}

/* ════════════════════════════════════════════
   MODELOS DE E-MAIL PARA AS FACULDADES
   Texto puro: a saída é para copiar e colar no cliente
   de e-mail, então nada de HTML aqui.
   ════════════════════════════════════════════ */

const ASSINATURA_EMAIL = `Atenciosamente,

Associação Allos
CNPJ ${ALLOS_INST.cnpj}
${ALLOS_INST.endereco}
${ALLOS_REP.email}`;

const trat = (fac) => (fac && fac.contatoNome)
  ? `Prezado(a) ${fac.contatoNome},`
  : "Prezada Coordenação de Estágios,";

const nf = (fac) => (fac && (fac.nome || fac.sigla)) || "[faculdade]";
const ne = (est) => (est && est.nome) || "[estagiário(a)]";

export const MODELOS_EMAIL = [
  {
    id: "envio_tce",
    titulo: "Envio de TCE para assinatura",
    icone: "📤",
    descricao: "Encaminha o termo preenchido ao setor de estágio para assinatura e validação.",
    precisaEstagiario: true,
    build: ({ est, fac, sup }) => ({
      assunto: `Termo de Compromisso de Estágio — ${ne(est)} — Associação Allos`,
      corpo: `${trat(fac)}

Encaminhamos, em anexo, o Termo de Compromisso de Estágio Não Obrigatório referente ao(à) estudante ${ne(est)}, para conferência, assinatura e validação por essa instituição.

Dados do estágio:

• Estagiário(a): ${ne(est)}${est && est.cpf ? ` — CPF ${est.cpf}` : ""}
• Curso: Psicologia${est && est.periodo ? ` — ${est.periodo}` : ""}
• Instituição de ensino: ${nf(fac)}
• Concedente: Associação Allos — CNPJ ${ALLOS_INST.cnpj}
• Supervisor(a) responsável: ${sup ? `${sup.nome} — CRP ${sup.crp || "[CRP]"}` : "[supervisor(a)]"}
• Vigência: ${est && est.dataInicio ? dataBR(est.dataInicio) : "[início]"} a ${est && est.dataFim ? dataBR(est.dataFim) : "[término]"}
• Carga horária: ${(fac && fac.cargaHoraria) || (est && est.cargaHoraria) || "30 horas semanais"}
• Bolsa: R$ ${(est && est.bolsa) || "[valor]"}
• Seguro de acidentes pessoais: apólice nº ${(est && est.apolice) || "[nº]"} — ${(est && est.seguradora) || "[seguradora]"}

O estágio é acompanhado por supervisão clínica regular conduzida por psicólogo(a) com registro ativo no Conselho Regional de Psicologia, conforme exigido pelo art. 3º, III, da Lei nº 11.788/2008.

Caso seja necessário utilizar o formulário próprio dessa instituição ou incluir alguma cláusula específica, pedimos a gentileza de nos informar para que façamos o ajuste.

Ficamos à disposição para quaisquer esclarecimentos.

${ASSINATURA_EMAIL}`,
    }),
  },
  {
    id: "convenio",
    titulo: "Solicitação de convênio novo",
    icone: "🤝",
    descricao: "Primeira aproximação com uma faculdade sem convênio: apresenta o campo de estágio e pede a documentação.",
    precisaEstagiario: false,
    build: ({ fac }) => ({
      assunto: `Solicitação de convênio de estágio — Associação Allos (Psicologia)`,
      corpo: `${trat(fac)}

A Associação Allos é uma associação civil sem fins lucrativos, inscrita no CNPJ ${ALLOS_INST.cnpj}, sediada em ${ALLOS_INST.cidade}, que atua com atendimento psicológico clínico e clínica social, além de pesquisa e divulgação científica em Psicologia.

Gostaríamos de formalizar convênio de estágio não obrigatório com ${nf(fac)}, a fim de oferecer campo de prática a estudantes do curso de Psicologia.

Sobre o campo de estágio:

• Atividades: atendimento psicológico individual e em grupo, presencial e remoto; participação em supervisão; elaboração de documentos técnicos; participação em projetos de clínica social, pesquisa e divulgação científica.
• Supervisão: todos os atendimentos são acompanhados por supervisão clínica regular, individual e/ou grupal, conduzida por psicólogo(a) com registro ativo no CRP, que responde tecnicamente pelos atendimentos.
• Carga horária: até 6 horas diárias e 30 horas semanais, com flexibilidade em relação ao turno das aulas, provas e trabalhos didáticos, conforme a Lei nº 11.788/2008.
• Bolsa de complementação educacional e auxílio-transporte, pagos até o 10º dia útil do mês subsequente.
• Seguro de acidentes pessoais contratado pela concedente em favor do(a) estagiário(a), na forma do art. 9º da Lei nº 11.788/2008.
• Férias de 30 dias anuais, preferencialmente no período de férias escolares, ou proporcionais à vigência.

Para darmos andamento, poderiam nos informar:

1. Quais documentos essa instituição exige da concedente (contrato social/estatuto, comprovante de CNPJ, dados do supervisor, outros);
2. Se há formulário próprio de Termo de Compromisso de Estágio a ser utilizado, ou se aceitam o nosso modelo;
3. Se é exigido plano de atividades e/ou designação de professor(a) orientador(a);
4. Qual o fluxo e o prazo para assinatura dos termos.

Agradecemos a atenção e ficamos à disposição para uma conversa, presencial ou remota, sobre a parceria.

${ASSINATURA_EMAIL}`,
    }),
  },
  {
    id: "renovacao",
    titulo: "Renovação / prorrogação de TCE",
    icone: "🔄",
    descricao: "Avisa que o termo está vencendo e solicita a prorrogação com as novas datas.",
    precisaEstagiario: true,
    build: ({ est, fac, sup }) => ({
      assunto: `Prorrogação de Termo de Compromisso de Estágio — ${ne(est)}`,
      corpo: `${trat(fac)}

O Termo de Compromisso de Estágio do(a) estudante ${ne(est)}, firmado com a Associação Allos, tem vigência até ${est && est.tceVenc ? dataBR(est.tceVenc) : (est && est.dataFim ? dataBR(est.dataFim) : "[data de vencimento]")}.

Temos interesse na continuidade do estágio e solicitamos a prorrogação do termo, mantidas as demais condições já pactuadas.

Dados atuais:

• Estagiário(a): ${ne(est)}${est && est.cpf ? ` — CPF ${est.cpf}` : ""}
• Supervisor(a) responsável: ${sup ? `${sup.nome} — CRP ${sup.crp || "[CRP]"}` : "[supervisor(a)]"}
• Vigência atual: ${est && est.dataInicio ? dataBR(est.dataInicio) : "[início]"} a ${est && est.dataFim ? dataBR(est.dataFim) : "[término]"}
• Nova vigência pretendida: ${est && est.dataFim ? dataBR(est.dataFim) : "[término atual]"} a [informar nova data]
• Carga horária: ${(fac && fac.cargaHoraria) || (est && est.cargaHoraria) || "30 horas semanais"}
• Bolsa: R$ ${(est && est.bolsa) || "[valor]"}
• Seguro de acidentes pessoais: apólice nº ${(est && est.apolice) || "[nº]"} — ${(est && est.seguradora) || "[seguradora]"}${est && est.seguroVenc ? ` (vigente até ${dataBR(est.seguroVenc)})` : ""}

Lembramos que, nos termos do art. 11 da Lei nº 11.788/2008, a duração do estágio na mesma parte concedente não pode exceder 2 (dois) anos, salvo para estagiário com deficiência.

Pedimos a gentileza de nos informar o procedimento e enviar o termo aditivo, caso essa instituição utilize formulário próprio.

${ASSINATURA_EMAIL}`,
    }),
  },
  {
    id: "desligamento",
    titulo: "Desligamento / encerramento",
    icone: "📕",
    descricao: "Comunica o fim do estágio à faculdade e coloca o relatório final à disposição.",
    precisaEstagiario: true,
    build: ({ est, fac, sup }) => ({
      assunto: `Encerramento de estágio — ${ne(est)}`,
      corpo: `${trat(fac)}

Comunicamos o encerramento do estágio não obrigatório do(a) estudante ${ne(est)} junto à Associação Allos.

Dados do encerramento:

• Estagiário(a): ${ne(est)}${est && est.cpf ? ` — CPF ${est.cpf}` : ""}
• Período realizado: ${est && est.dataInicio ? dataBR(est.dataInicio) : "[início]"} a ${est && est.dataFim ? dataBR(est.dataFim) : "[término]"}
• Supervisor(a) responsável: ${sup ? `${sup.nome} — CRP ${sup.crp || "[CRP]"}` : "[supervisor(a)]"}
• Motivo: [conclusão do período / desligamento a pedido do(a) estudante / colação de grau / rescisão]

O relatório de atividades do período está à disposição dessa instituição e pode ser encaminhado mediante solicitação, bem como a declaração de estágio, se necessária ao(à) estudante.

Registramos nosso agradecimento pela parceria e permanecemos à disposição para novos encaminhamentos.

${ASSINATURA_EMAIL}`,
    }),
  },
];
