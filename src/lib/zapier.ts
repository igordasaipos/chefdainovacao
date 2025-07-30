// Função para enviar dados para o Zapier webhook quando uma nova ideia é criada
export const sendIdeiaToZapier = async (ideiaData: any) => {
  console.log('🚀 INICIANDO envio para Zapier - Nova Ideia...');
  console.log('💡 Dados da ideia:', ideiaData);
  
  try {
    const zapierData = {
      timestamp: new Date().toISOString(),
      evento: "nova_ideia",
      ideia: {
        titulo: ideiaData.titulo,
        descricao: ideiaData.descricao,
        complexidade: ideiaData.complexidade,
        status: ideiaData.status,
        criado_por: ideiaData.criado_por,
        nome_restaurante: ideiaData.nome_restaurante,
        tipo_cliente: ideiaData.tipo_cliente,
        nome_cliente: ideiaData.nome_cliente,
        whatsapp_criador: ideiaData.whatsapp_criador,
        admin_criador: ideiaData.admin_criador,
        data_criacao: new Date(ideiaData.criado_em).toLocaleString('pt-BR')
      }
    };

    console.log('📤 Dados formatados para Zapier:', zapierData);
    console.log('🌐 Enviando para webhook...');

    const response = await fetch('https://hooks.zapier.com/hooks/catch/19735149/u43entq/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(zapierData),
    });

    console.log('🎉 Nova ideia enviada para Zapier!');

  } catch (error) {
    console.error('💥 ERRO ao enviar nova ideia para Zapier:', error);
    // Não bloqueia o fluxo principal se falhar
  }
};