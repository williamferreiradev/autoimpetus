export const useProperties = () => {
    const properties = useState('properties', () => [
        {
            id: '1',
            title: 'Cobertura Duplex Cyrela By Pininfarina',
            location: 'Vila Olímpia, São Paulo, SP',
            price: 'R$ 45.000',
            condominio: 'R$ 4.500',
            iptu: 'R$ 1.200',
            type: 'Aluguel Mensal',
            description: `Descubra a sofisticação absoluta nesta cobertura duplex projetada com a assinatura inconfundível do estúdio de design italiano Pininfarina. Localizada no coração pulsante da Vila Olímpia, esta residência é uma masterclass em elegância contemporânea.\n\nCom amplos espaços abertos, janelas do chão ao teto que banham os ambientes com luz natural e vistas desobstruídas do skyline de São Paulo. Os acabamentos incluem mármores importados, painéis de madeira nogueira e automação residencial completa, controlada por voz ou aplicativo.\n\nA área íntima no piso superior oferece privacidade total com suítes master completas, enquanto o living integrado no piso inferior, com terraço e piscina com borda infinita aquecida, proporciona o cenário definitivo para receber com grandeza.`,
            specs: { beds: 4, baths: 5, area: 320, parking: 4 },
            images: [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            amenities: [
                'Automação Residencial Total',
                'Piscina com Borda Infinita (Aquecida)',
                'Cozinha Gourmet Gaggenau',
                'Adega Climatizada (300 garrafas)',
                'Home Theater Cinema',
                'Elevador Privativo',
                'Academia no Condomínio',
                'Segurança 24h Armada e Blindada'
            ],
            tags: ['Exclusivo', 'Mobiliado', 'Assinatura']
        },
        {
            id: '2',
            title: 'Mansão Contemporânea Cidade Jardim',
            location: 'Cidade Jardim, São Paulo',
            price: 'R$ 80.000',
            condominio: 'R$ 8.500',
            iptu: 'R$ 5.200',
            type: 'Aluguel',
            description: 'Uma verdadeira obra de arte arquitetônica localizada no bairro mais nobre da cidade. Esta mansão linear oferece luxo no mais alto padrão.',
            specs: { beds: 5, baths: 7, area: 850, parking: 6 },
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            images: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            amenities: ['Piscina Aquecida', 'Quadra de Tênis Privativa', 'Heliponto', 'Adega'],
            tags: ['Vista Panorâmica', 'Piscina Privativa']
        },
        {
            id: '3',
            title: 'Apartamento de Luxo no Itaim Bibi',
            location: 'Itaim Bibi, São Paulo',
            price: 'R$ 32.000',
            condominio: 'R$ 3.500',
            iptu: 'R$ 900',
            type: 'Aluguel',
            description: 'Projetos modernos encontram o conforto nesta unidade com vista direta para o parque. Mobilia Breton impressa em todos os detalhes.',
            specs: { beds: 3, baths: 4, area: 210, parking: 3 },
            image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            images: [
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            amenities: ['Academia', 'Piscina com Raia', 'Spa', 'Varanda Gourmet'],
            tags: ['Decorado', 'Automação']
        },
        {
            id: '4',
            title: 'Casa de Condomínio Fazenda Boa Vista',
            location: 'Porto Feliz, SP',
            price: 'R$ 120.000',
            condominio: 'R$ 5.500',
            iptu: 'R$ 2.200',
            type: 'Aluguel Mensal',
            description: 'Refúgio espetacular a menos de 1 hora de SP. Decoração suntuosa para quem valoriza a máxima excelência do campo.',
            specs: { beds: 6, baths: 8, area: 1200, parking: 8 },
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            amenities: ['Campo de Golfe', 'Haras', 'Spa Fasano', 'Boulevard'],
            tags: ['Campo de Golfe', 'Spa Privativo']
        },
        {
            id: '5',
            title: 'Penthouse Faria Lima',
            location: 'Pinheiros, São Paulo',
            price: 'R$ 55.000',
            condominio: 'R$ 6.000',
            iptu: 'R$ 1.800',
            type: 'Aluguel',
            description: 'Viva acima de todos em uma cobertura Triple A com vista esplêndida. Conta com piscina iluminada em LED no rooftop.',
            specs: { beds: 4, baths: 4, area: 410, parking: 5 },
            image: 'https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            images: [
                'https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            amenities: ['Rooftop', 'Piscina de Vidro', 'Churrasqueira', 'Sala de Cinema'],
            tags: ['Design Assinado', 'Rooftop']
        },
        {
            id: '6',
            title: 'Loft Industrial Jardins',
            location: 'Jardim Paulista, São Paulo',
            price: 'R$ 18.000',
            condominio: 'R$ 2.000',
            iptu: 'R$ 600',
            type: 'Aluguel',
            description: 'Ambiente nova-iorquino refinado no meio de São Paulo. Concreto aparente, estruturas metálicas em negro fosco e madeira maciça.',
            specs: { beds: 1, baths: 2, area: 140, parking: 2 },
            image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            images: [
                'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
            ],
            amenities: ['Pé Direito Duplo', 'Design Industrial', 'Janelas Acústicas'],
            tags: ['Pé Direito Duplo', 'Design']
        }
    ])

    const addProperty = (prop: any) => {
        properties.value.unshift({
            ...prop,
            id: Math.random().toString(36).substr(2, 9),
            image: prop.images && prop.images.length ? prop.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
        })
    }

    const updateProperty = (id: string, prop: any) => {
        const index = properties.value.findIndex(p => p.id === id)
        if (index !== -1) {
            properties.value[index] = { ...properties.value[index], ...prop }
        }
    }

    const deleteProperty = (id: string) => {
        properties.value = properties.value.filter(p => p.id !== id)
    }

    return {
        properties,
        addProperty,
        updateProperty,
        deleteProperty
    }
}
