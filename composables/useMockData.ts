import type { Cliente } from '@/types/crm'

export const useMockData = () => {
    const mockMetrics = {
        total: 23,
        interested: 15,
        newLeads: 9,
        locked: 2
    }
    
    const mockLeads: Partial<Cliente>[] = [
        {
            id: 'mock-lead-1',
            name: 'Helena Bittencourt',
            remotejid: '5511987654321',
            is_qualified: true,
            qualificado: true,
            vertical: 'Mansão Em Alphaville',
            Ativado: true,
            status_crm: 'qualificando',
            estagiokanbam: 'qualificando',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            metadata: {
                notes: 'Buscando imóvel para a família em Alphaville. Altamente interessada em projeto contemporâneo.'
            }
        },
        {
            id: 'mock-lead-2',
            name: 'Alexandre Diniz',
            remotejid: '5511976543210',
            is_qualified: true,
            qualificado: true,
            vertical: 'Cobertura Duplex',
            Ativado: true,
            status_crm: 'agendado',
            estagiokanbam: 'agendado',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            metadata: {
                notes: 'Procura cobertura com vista panorâmica. Agendou visita amanhã às 14h no Jardim Europa.'
            }
        },
        {
            id: 'mock-lead-3',
            name: 'Isabelle Mello',
            remotejid: '5511965432109',
            is_qualified: false,
            qualificado: false,
            vertical: 'Apartamento Studio',
            Ativado: false,
            trava: true,
            status_crm: 'contato',
            estagiokanbam: 'contato',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            metadata: {
                notes: 'Aguardando aprovação de crédito para fechar o aluguel do flat no Itaim Bibi.'
            }
        },
        {
            id: 'mock-lead-4',
            name: 'Roberto Drummond',
            remotejid: '5511954321098',
            is_qualified: true,
            qualificado: true,
            vertical: 'Casa de Condomínio',
            Ativado: true,
            status_crm: 'qualificado',
            estagiokanbam: 'qualificado',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            metadata: {
                notes: 'Fechou o contrato de locação da casa em Tamboré. Pagamento adiantado.'
            }
        },
        {
            id: 'mock-lead-5',
            name: 'Henrique Toledo',
            remotejid: '5511943210987',
            is_qualified: false,
            qualificado: false,
            vertical: 'Sala Comercial',
            Ativado: true,
            status_crm: 'novo',
            estagiokanbam: 'novo',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            metadata: {
                notes: 'Precisa de laje corporativa de alto padrão na Faria Lima para nova sede.'
            }
        },
        {
            id: 'mock-lead-6',
            name: 'Carolina Alcântara',
            remotejid: '5511932109876',
            is_qualified: false,
            qualificado: false,
            vertical: 'Loft',
            Ativado: true,
            status_crm: 'novo',
            estagiokanbam: 'novo',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            metadata: {
                notes: 'Primeiro contato via site. Quer saber valores de locação na Vila Nova Conceição.'
            }
        },
        {
            id: 'mock-lead-7',
            name: 'Vicente Navarro',
            remotejid: '5511921098765',
            is_qualified: true,
            qualificado: true,
            vertical: 'Cobertura Linear',
            Ativado: true,
            status_crm: 'Engajado',
            estagiokanbam: 'Engajado',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            metadata: {
                notes: 'Investidor interessado em imóvel de alto padrão para retrofit na região dos Jardins.'
            }
        }
    ]

    const mockChats = {
        'mock-lead-1': [
            { id: '1', role: 'user', content: 'Olá, vi o anúncio no site sobre a mansão em Alphaville. Qual o valor?', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: '2', role: 'assistant', content: 'Olá, Helena! 😊 Que bom falar com você! Essa mansão é realmente um dos nossos imóveis mais exclusivos. O valor de venda está estabelecido em R$ 15.000.000. Você busca um projeto mais voltado ao clássico ou contemporâneo?', created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString() },
            { id: '3', role: 'user', content: 'Eu procuro algo bem contemporâneo, envidraçado e com bastante integração de espaços. Meu marido quer para daqui a 3 meses.', created_at: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
            { id: '4', role: 'assistant', content: 'Entendo perfeitamente, Helena! Essa propriedade atende exatamente a esse perfil: muita iluminação natural e conceito aberto 🏡\n\nTemos horários disponíveis nesta quinta e sexta-feira para uma visita in loco. Qual funciona melhor pra você e sua família?', created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
            { id: '5', role: 'user', content: 'Que legal! Quinta à tarde seria bom, depois das 15h.', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: '6', role: 'assistant', content: 'Perfeito! Vou reservar sua visita técnica para a quinta às 15h30. 📋\n\nNossa corretora senior estará lá para mostrar todos os diferenciais de acabamento.\nVou enviar ao seu email as instruções de acesso ao condomínio. Qualquer dúvida, estou à disposição! 😊', created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
        ],
        'mock-lead-2': [
            { id: '1', role: 'user', content: 'Bom dia, vi a cobertura duplex no Jardim Europa. O preço está na casa dos 20 milhões?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
            { id: '2', role: 'assistant', content: 'Bom dia, Alexandre! Exato, a cobertura está precificada em R$ 22.000.000. É um dos metros quadrados mais cobiçados de São Paulo. 🏙️\n\nA vista de 360 graus do skyline é incrível. O senhor busca o imóvel já mobiliado?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
            { id: '3', role: 'user', content: 'Queria que fosse mobiliado ou semi mobiliado. Tem armários pelo menos?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
            { id: '4', role: 'assistant', content: 'Sim, todos os armários são da Ornare e os eletrodomésticos da linha premium da Gaggenau. 🤩\n\nTemos bastante procura por unidades prontas para morar nesse padrão. Gostaria de agendar uma visita amanhã à tarde sem compromisso?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
            { id: '5', role: 'user', content: 'Pode sim, amanhã às 14h ficaria bom pra mim.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
            { id: '6', role: 'assistant', content: 'Agendado! ✅ Amanhã às 14h.\n\nEnviarei os detalhes do endereço via WhatsApp e nosso time estará a postos. Até amanhã, Alexandre! 🤝', created_at: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString() },
        ],
        'mock-lead-3': [
            { id: '1', role: 'user', content: 'Oi, boa noite! O aluguel daquele studio no Itaim Bibi tá saindo quanto com condomínio?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
            { id: '2', role: 'assistant', content: 'Boa noite, Isabelle! 😊 O pacote completo do studio de luxo (aluguel + condomínio + IPTU) sai por R$ 8.500/mês.\n\nEle já vem 100% equipado e decorado por arquiteto renomado. O que você acha? Quando planeja mudar?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString() },
            { id: '3', role: 'user', content: 'Queria para esse mês ainda. Tem margem para negociação ou algum tipo de seguro fiança que vocês parcelam?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
            { id: '4', role: 'assistant', content: 'Entendo, Isabelle! Sim, trabalhamos com as seguradoras tradicionais e conseguimos parcelamento do seguro fiança 💳\n\nPodemos fazer sua análise de crédito hoje mesmo. Tem um horário na agenda para visitar o prédio e fecharmos negócio?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString() },
            { id: '5', role: 'user', content: 'Vou falar com o pessoal sobre a fiança primeiro e depois respondo.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString() },
            { id: '6', role: 'assistant', content: 'Claro, fique à vontade. 🤗\n\nQuando quiser avançar com a documentação, eu te mando o link. Qualquer dúvida sobre a mobília ou as facilidades do prédio, é só chamar.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString() },
        ],
        'mock-lead-4': [
            { id: '1', role: 'user', content: 'Roberto aqui. Eu confirmei a locação da casa em Tamboré. Quero pagar o primeiro ano adiantado.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString() },
            { id: '2', role: 'assistant', content: 'Olá, Roberto! 🎉 Ótima notícia.\n\nCom o pagamento anual antecipado conseguimos isentar você de fiador e aplicar um excelente desconto no valor do pacote.\n\nVou emitir a minuta do contrato e os dados bancários. O pagamento será via PIX?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString() },
            { id: '3', role: 'user', content: 'Exato. PIX. Que chique! Gostei da agilidade. Eu assino digitalmente?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 73).toISOString() },
            { id: '4', role: 'assistant', content: 'Sim! Enviamos tudo via DocuSign, totalmente seguro e rápido. 💻\n\nO valor do repasse está sendo gerado agora e enviamos para sua validação em minutos.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
            { id: '5', role: 'user', content: 'Certo, fico no aguardo.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString() },
            { id: '6', role: 'assistant', content: 'Fechado! ✅\n\nAs chaves serão entregues assim que o repasse for confirmado e as assinaturas entrarem.\n\nSeja muito bem vindo à sua nova residência, Roberto! Será um prazer ter você como nosso cliente. 🤝', created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString() },
        ],
        'mock-lead-5': [
            { id: '1', role: 'user', content: 'Vocês têm algo comercial na Faria Lima? Laje corporativa de alto padrão.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            { id: '2', role: 'assistant', content: 'Boa tarde, Henrique! Sim, trabalhamos com as lajes mais disputadas do eixo Faria Lima.\n\nVocê precisa de quantos metros quadrados? Estamos falando de um espaço para quantas pessoas aproximadamente?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
            { id: '3', role: 'user', content: 'Pelo menos 400m². A gente quer um andar inteiro pra nossa holding. Tem que ser AAA.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
            { id: '4', role: 'assistant', content: 'Entendi o perfil do pedido, Marcos. Temos duas opções Triple A que acabaram de vagar nos edifícios Pátio Malzoni e B32.\n\nPara essas metragens comerciais, eu consigo montar uma apresentação detalhada com a planta. Gostaria de agendar uma reunião comercial para conversarmos melhor amanhã cedo?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        ],
        'mock-lead-6': [
            { id: '1', role: 'user', content: 'Quero saber se compensa mais comprar ou alugar na Vila Nova Conceição.', created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
            { id: '2', role: 'assistant', content: 'Olá, Carolina! A Vila Nova Conceição é nosso bairro número um no conceito de liquidez. 🌳\n\nTudo depende do seu horizonte de investimento. Um aluguel de alto padrão hoje na região varia de 12k a 35k. Já as vendas partem dos R$ 4 milhões.\n\nVocê pretende ficar na região por mais de cinco anos ou é algo de curto prazo?', created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString() },
            { id: '3', role: 'user', content: 'Vou morar pelo menos 2 anos lá, gosto do Ibirapuera. Então acho que locação talvez?', created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
            { id: '4', role: 'assistant', content: 'Perfeito, Carolina! Para 2 anos o aluguel é frequentemente a escolha mais prudente financeiramente. 🎯\n\nTemos excelentes lofts e aptos próximos ao parque. Gostaria de agendar um call com um de nossos corretores para entender seu estilo de vida e encontrar algo especial?', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        ],
        'mock-lead-7': [
            { id: '1', role: 'user', content: 'Oi, tenho interesse nas coberturas antigas dos Jardins. Quero comprar, reformar e dar flip.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString() },
            { id: '2', role: 'assistant', content: 'Olá, Vicente! Retrofit nos Jardins é uma de nossas especialidades de sourcing de imóveis. 🛠️\n\nTemos algumas unidades off-market nesse perfil que demandam grandes reformas mas têm ótimo retorno. Preços entre R$ 6.000.000 e R$ 12.000.000.\n\nVocê já atua nesse segmento imobiliário há bastante tempo?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
            { id: '3', role: 'user', content: 'Sim, invisto faz uns 8 anos no exterior e cheguei no Brasil agora. Estou atrás de oportunidades de 400m2 pra mais.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString() },
            { id: '4', role: 'assistant', content: 'Excelente background, Arthur. Bem-vindo de volta! 💪\n\nEu tenho exatamente o que você procura: uma cobertura linear de 510m² na Rua Oscar Freire. Extremamente rara.\n\nGostaria de visitar o imóvel para avaliar o potencial estrutural na sexta-feira à tarde?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
            { id: '5', role: 'user', content: 'Sexta-feira eu consigo. Umas 14h30?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
            { id: '6', role: 'assistant', content: 'Fechado! 📅 Sexta às 14h30.\n\nVou pedir ao nosso consultor especializado em retrofit para lhe acompanhar.\n\nEnviaremos todas as instruções. Qualquer dúvida, é só nos chamar!', created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
        ],
    }

    const mockSummaries: Record<string, string> = {
        'mock-lead-1': '📋 **Resumo da Conversa — Helena Bittencourt**\n\n• Interesse: Mansão em Alphaville\n• Motivação: Buscando imóvel novo familiar para até 3 meses\n• Perfil do imóvel: Estilo contemporâneo e ensolarado\n• Valor do imóvel: R$ 15.000.000\n• Status: Visita técnica AGENDADA para quinta às 15h30\n• Temperatura: 🔥 Quente — urgência para a compra\n• Próximo passo: Apresentação da casa no local',
        'mock-lead-2': '📋 **Resumo da Conversa — Alexandre Diniz**\n\n• Interesse: Cobertura Duplex no Jd. Europa\n• Motivação: Busca vista panorâmica e acabamento de altíssimo padrão\n• Demanda: Apartamento que tenha armários (Ornare)\n• Valor do imóvel: R$ 22.000.000\n• Status: Visita AGENDADA para amanhã às 14h\n• Temperatura: 🔥 Quente — compra imedia\n• Próximo passo: Visita do duplex e apresentação da documentação',
        'mock-lead-3': '📋 **Resumo da Conversa — Isabelle Mello**\n\n• Interesse: Apartamento Studio (locação)\n• Locação mensal: R$ 8.500 no Itaim Bibi\n• Objeção: Detalhes de seguro fiança e fiador\n• Valor da operação: R$ 8.500 mensais + taxas\n• Status: AGUARDANDO retorno após falar com financeiro familiar\n• Temperatura: ⚠️ Morno — demanda real, mas trava de crédito existe\n• Próximo passo: Follow-up para oferecer ficha e análise hoje',
        'mock-lead-4': '📋 **Resumo da Conversa — Roberto Drummond**\n\n• Interesse: Casa de Condomínio em Tamboré (locação)\n• Perfil: Locatário direto que adiantou o valor do 1º ano\n• Pagamento: Anual (via PIX) com isenção de fiador\n• Status: FECHADO ✅ — Emitindo contrato no DocuSign\n• Temperatura: 🔥🔥 Quente — Transação realizada\n• Próximo passo: Aguardar pagamento e protocolar entrega de chaves',
        'mock-lead-5': '📋 **Resumo da Conversa — Henrique Toledo**\n\n• Interesse: Laje Corporativa na Faria Lima\n• Motivação: Nova sede corporativa Triple A\n• Situação: Pedido de no mínimo 400m²\n• Status: Aguardando verificação da planta e agendamento de call\n• Temperatura: 🔥 Quente — Operação de alta rentabilidade\n• Próximo passo: Reunião para apresentar Pátio Malzoni e B32',
        'mock-lead-6': '📋 **Resumo da Conversa — Carolina Alcântara**\n\n• Interesse: Loft para locação perto do Ibirapuera\n• Dúvida: Comprar x Alugar na Vila Nova Conceição\n• Perspectiva: Ficar 2 anos na região\n• Status: Aguardando call do consultor ou agendamento de imovel.\n• Temperatura: ⚠️ Morno — Início de contato\n• Próximo passo: Conversar com corretor de locação',
        'mock-lead-7': '📋 **Resumo da Conversa — Vicente Navarro**\n\n• Interesse: Compra de imóvel antigo linear para Retrofit (flip)\n• Background: Investidor do exterior, procurando grandes plantas (+400m²)\n• Soluções passadas: Rara cobertura de 510m² na Oscar Freire\n• Status: Visita AGENDADA p/ sexta 14h30\n• Temperatura: 🔥 Quente — Investidor pronto. Alta margem e rápida tomada de decisão\n• Próximo passo: Apresentar avaliação no local.',
    }

    const mockWeeklyMetrics: Record<string, any> = {
        'semana-1': { totalLeads: 8, qualificados: 3, agendamentos: 2, convertidos: 1, taxaConversao: 12.5, tempoMedioResposta: '4min', receita: 17800, novosContatos: 5 },
        'semana-2': { totalLeads: 6, qualificados: 2, agendamentos: 3, convertidos: 2, taxaConversao: 33.3, tempoMedioResposta: '3min', receita: 42000, novosContatos: 4 },
        'semana-3': { totalLeads: 5, qualificados: 4, agendamentos: 4, convertidos: 1, taxaConversao: 20.0, tempoMedioResposta: '2min', receita: 22000, novosContatos: 3 },
        'semana-4': { totalLeads: 4, qualificados: 2, agendamentos: 1, convertidos: 0, taxaConversao: 0, tempoMedioResposta: '5min', receita: 0, novosContatos: 2 },
    }

    const mockActivityLog = [
        { id: '1', type: 'deal_closed', text: 'Roberto Drummond fechou a locação do imóvel Tamboré (anual)', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), week: 'semana-1' },
        { id: '2', type: 'meeting_scheduled', text: 'Helena Bittencourt agendou visita: Mansão em Alphaville', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), week: 'semana-1' },
        { id: '3', type: 'lead_qualified', text: 'Alexandre Diniz está qualificado para cobertura de 22M', time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), week: 'semana-1' },
        { id: '4', type: 'ai_action', text: 'IA enviou follow-up de opções para locação na Vila Nova Conceição', time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), week: 'semana-1' },
        { id: '5', type: 'lead_new', text: 'Carolina Alcântara buscou consultoria imobiliária no site', time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), week: 'semana-1' },
        { id: '6', type: 'meeting_scheduled', text: 'Vicente Navarro agendou visita Oscar Freire para sexta 14h30', time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), week: 'semana-1' },
        { id: '7', type: 'lead_qualified', text: 'Henrique Toledo aprovou apresentação comercial da Faria Lima', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), week: 'semana-1' },
        { id: '8', type: 'deal_closed', text: 'Locação finalizada de studio premium - Itaim Bibi', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), week: 'semana-2' },
        { id: '9', type: 'meeting_scheduled', text: '3 novas visitas de coberturas em Higienópolis', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), week: 'semana-2' },
        { id: '10', type: 'ai_action', text: 'IA reativou leads antigos para propostas no Anália Franco', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), week: 'semana-2' },
        { id: '11', type: 'lead_new', text: '4 leads na nova campanha off-market', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(), week: 'semana-2' },
        { id: '12', type: 'deal_closed', text: 'Venda ap. Moema Pássaros — R$ 4.000.000', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), week: 'semana-2' },
        { id: '13', type: 'lead_qualified', text: '4 investidores aprovados na semana (renda atestada)', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(), week: 'semana-3' },
        { id: '14', type: 'meeting_scheduled', text: '4 grandes visitas agendadas nos Jardins', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(), week: 'semana-3' },
        { id: '15', type: 'ai_action', text: 'Análise aponta: perfil de retrofit engaja 8% mais nas manhãs de segunda', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), week: 'semana-3' },
        { id: '16', type: 'lead_new', text: 'Mercado de aluguéis AAA continua crescendo (2 leads)', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(), week: 'semana-4' },
        { id: '17', type: 'ai_action', text: 'IA sugeriu destacar varanda gourmet nas segmentações', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 23).toISOString(), week: 'semana-4' },
    ]

    const mockWeeklyReports: Record<string, any> = {
        'semana-1': {
            title: 'Semana 24 Fev – 02 Mar',
            resumo: 'Operamos um volume excepcional. Fechamento de alto ticket (Locação Tamboré - Pgmt Anual). Pipeline possui 3 contatos ultrarrápidos qualificados e alto volume em luxo.',
            destaques: [
                '🏆 Fechamento Roberto Drummond — Pagamento pacote anual',
                '📈 Vicente Navarro iniciando flip-invest — 500m² visitados.',
                '📅 2 reuniões no Jardim Europa já avançando documentação',
            ],
            conselhos: [
                'Eduardo e Vicente precisam de velocidade documental: foquem nisso em caso de proposta',
                'Fale sobre as opções B32 ou Pátio Malzoni c/ Henrique o mais breve',
            ],
            alertas: [
                '⚠️ Os investidores costumam mudar o foco se não tiver reposte ráp.',
            ],
        },
        'semana-2': {
            title: 'Semana 17 – 23 Fev',
            resumo: 'Semana sólida nas transações de venda e locação AAA.',
            destaques: [
                '🏆 Venda confirmada nos r$ 4 Milhões (Moema)',
                '📈 Campanha Off market gera bons frutos e retenção',
                '📅 Várias avaliações em andamento',
            ],
            conselhos: [
                'Atacarem e engajarem a base fria que visualiza locação. Mudar funil',
            ],
            alertas: [
                '⚠️ Sem demoras nos retornos aos locatários interessados na VM ou Moema.',
            ],
        },
        'semana-3': {
            title: 'Semana 10 – 16 Fev',
            resumo: 'Semana muito boa sobre novas prospeccções nos Jardins.',
            destaques: [
                '🏆 Captações de alto padrão subindo para nossa equipe interna',
                '📊 Mídia social com 14.5% retorno sobre engajamentos nas varandas gourmet',
                '📅 Boas visitas com executivos em flats',
            ],
            conselhos: [
                'Mostrem sempre vídeos detalhados para facilitar os leads',
            ],
            alertas: [
                '⚠️ Gap nas assinaturas de propostas — simplificar burocracia do lado CRM',
            ],
        },
        'semana-4': {
            title: 'Semana 03 – 09 Fev',
            resumo: 'Férias / Feriado - leads caindo e sem conversões na época.',
            destaques: [
                '📊 Baixo de ofertas concretas mas boas sondagens.',
                '🔍 Investimento em anúncios mantido e melhorado.',
            ],
            conselhos: [
                'Melhor esperar feriado porem câmara as conversações',
            ],
            alertas: [
                '🚨 Zero conversoes da base fria. Continuar ativando.',
            ],
        },
    }

    const mockChartData: Record<string, any> = {
        funnel: [
            { label: 'Novos', value: 23, color: '#D4AF37' },
            { label: 'Contato', value: 15, color: '#C09D33' },
            { label: 'Qualificados', value: 11, color: '#A18222' },
            { label: 'Agendados', value: 10, color: '#755F16' },
            { label: 'Convertidos', value: 4, color: '#4A3D0D' },
        ],
        weeklyTrend: [
            { week: 'Sem 1', leads: 4, conversoes: 0 },
            { week: 'Sem 2', leads: 5, conversoes: 1 },
            { week: 'Sem 3', leads: 6, conversoes: 2 },
            { week: 'Sem 4', leads: 8, conversoes: 1 },
        ],
    }

    return {
        mockMetrics,
        mockLeads,
        mockChats,
        mockSummaries,
        mockWeeklyMetrics,
        mockActivityLog,
        mockWeeklyReports,
        mockChartData
    }
}
