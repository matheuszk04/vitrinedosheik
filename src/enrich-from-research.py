"""Aplica ao catálogo os dados de fragrância levantados em pesquisa.

Notas, marca, gênero e família vêm de fontes públicas (Fragrantica, Parfumo e
os sites das próprias marcas) — são dados publicados do produto, não invenção.

Intensidade, projeção e fixação são leitura editorial a partir da estrutura das
notas, exceto onde a fonte trazia consenso da comunidade. Todos entram marcados
em `review` para o lojista confirmar com o produto na mão.

    python3 src/enrich-from-research.py [--aplicar]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "content" / "perfumes.json"

# Campos sempre marcados para conferência: são julgamento, não fato publicado.
SUBJECTIVE = ["profile", "personality", "atmosphere", "story", "perception",
              "recommendedFor", "notFor", "occasions", "moments", "climates"]

RESEARCH = {
    "asad-edp-normal": {
        "brand": "Lattafa", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Oriental", "Amadeirado", "Gourmand"],
        "notes": {
            "top": ["Pimenta Preta", "Abacaxi", "Tabaco"],
            "heart": ["Patchouli", "Café", "Íris"],
            "base": ["Baunilha", "Âmbar", "Madeira Seca", "Benjoim", "Labdanum"],
        },
        "accords": [("Amadeirado", 26), ("Baunilha", 24), ("Âmbar · Resina", 22), ("Gourmand · Doce", 16), ("Frutado", 12)],
        "personality": ["Denso", "Quente", "Viciante"],
        "profile": {"intensity": 5, "projection": 4, "longevity": 5},
        "occasions": ["Noite", "Evento", "Encontro"], "moments": ["noite"], "climates": ["frio", "ameno"],
        "tagline": "Tabaco, café e baunilha. Nada aqui é discreto.",
        "atmosphere": "Fim de noite num lugar de madeira escura: café forte, fumaça doce e alguém que não tem pressa de ir embora.",
        "story": "O Asad original é o que deu nome à casa. Abre com abacaxi e pimenta preta sobre tabaco, e vai escurecendo até um fundo de baunilha, âmbar e madeira seca. O café no coração é o que o separa dos outros doces — dá amargor onde seria só açúcar.",
        "perception": {
            "opens": "Abacaxi e pimenta preta sobre tabaco — doce e áspero ao mesmo tempo.",
            "becomes": "Café e patchouli puxam para baixo, e a íris segura o centro.",
            "ends": "Baunilha, âmbar e labdanum deixam um fundo espesso que gruda no tecido.",
        },
        "recommendedFor": "Quem quer o clássico da casa e não se importa em ser sentido de longe. Funciona melhor no frio e depois que escurece.",
        "notFor": "Se você precisa de algo neutro para o trabalho ou vive em cidade quente, ele vai pesar. É doce, é denso e não passa despercebido.",
        "map": {"x": 0.85, "y": 0.62},
    },
    "asad-bourbon": {
        "brand": "Lattafa", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Oriental", "Gourmand", "Amadeirado"],
        "notes": {
            "top": ["Pimenta Rosa", "Lavanda", "Ameixa Mirabelle"],
            "heart": ["Cacau", "Davana", "Noz-moscada"],
            "base": ["Vetiver", "Baunilha Bourbon", "Âmbar"],
        },
        "accords": [("Gourmand · Doce", 30), ("Baunilha", 24), ("Amadeirado", 20), ("Especiado", 16), ("Frutado", 10)],
        "personality": ["Aveludado", "Quente", "Elegante"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Noite", "Encontro", "Jantar"], "moments": ["noite"], "climates": ["frio", "ameno"],
        "tagline": "Cacau e baunilha bourbon, com lavanda para não virar sobremesa.",
        "atmosphere": "Uma taça servida devagar: madeira, cacau amargo e um doce que fica no fundo do copo.",
        "story": "Construído sobre cacau e baunilha bourbon, mas com lavanda e noz-moscada na entrada para cortar o açúcar. O vetiver no fundo evita que vire gourmand puro — sobra estrutura seca embaixo do doce.",
        "perception": {
            "opens": "Pimenta rosa e lavanda sobre ameixa — herbal e frutado ao mesmo tempo.",
            "becomes": "Cacau e noz-moscada tomam o centro e esquentam tudo.",
            "ends": "Baunilha bourbon e vetiver seguram por horas, doce sobre madeira.",
        },
        "recommendedFor": "Quem gosta de gourmand mas não quer cheirar a doce. É o mais vestível dos Asad.",
        "notFor": "Se você procura algo fresco ou cítrico para o calor, este é o oposto. Ele é quente por construção.",
        "map": {"x": 0.75, "y": 0.82},
    },
    "fakhar-black": {
        "brand": "Lattafa", "gender": "masculino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Aromático", "Amadeirado", "Fougère"],
        "notes": {
            "top": ["Maçã", "Bergamota", "Gengibre"],
            "heart": ["Lavanda", "Sálvia", "Zimbro", "Gerânio"],
            "base": ["Fava Tonka", "Cedro", "Amberwood", "Vetiver"],
        },
        "accords": [("Amadeirado", 28), ("Aromático", 24), ("Frutado", 18), ("Baunilha", 16), ("Cítrico", 14)],
        "personality": ["Limpo", "Versátil", "Confiante"],
        "profile": {"intensity": 3, "projection": 3, "longevity": 4},
        "occasions": ["Dia", "Trabalho", "Encontro"], "moments": ["manhã", "tarde"], "climates": ["ameno", "quente"],
        "tagline": "O que dá para usar todo dia sem cansar ninguém.",
        "atmosphere": "Camisa recém-passada, maçã verde e madeira limpa. Sem drama.",
        "story": "Maçã e gengibre na entrada, lavanda e sálvia no centro, tonka e cedro no fundo. É um aromático fougère de manual — e é justamente por isso que funciona: serve para o trabalho, para o dia e para quem não quer pensar muito.",
        "perception": {
            "opens": "Maçã e bergamota com um toque de gengibre.",
            "becomes": "Lavanda e sálvia formam um centro herbal e limpo.",
            "ends": "Tonka, cedro e vetiver deixam um fundo macio e seco.",
        },
        "recommendedFor": "Quem quer um perfume de todo dia que não erra. É o mais seguro da curadoria para ambiente de trabalho.",
        "notFor": "Se você procura algo marcante que as pessoas comentem, este não é. Ele foi feito para acompanhar, não para dominar.",
        "map": {"x": 0.48, "y": 0.40},
    },
    "fakhar-platinum": {
        "brand": "Lattafa", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Aromático", "Amadeirado", "Frutado"],
        "notes": {
            "top": ["Bergamota", "Pimenta Rosa", "Cardamomo"],
            "heart": ["Goiaba", "Lavanda", "Gengibre"],
            "base": ["Incenso", "Palo Santo", "Sândalo"],
        },
        "accords": [("Amadeirado", 28), ("Especiado", 22), ("Frutado", 20), ("Cítrico", 16), ("Âmbar · Resina", 14)],
        "personality": ["Claro", "Refinado", "Seco"],
        "profile": {"intensity": 3, "projection": 3, "longevity": 3},
        "occasions": ["Dia", "Trabalho", "Evento"], "moments": ["manhã", "tarde"], "climates": ["quente", "ameno"],
        "tagline": "Madeira clara com goiaba. Não é o que você espera de um árabe.",
        "atmosphere": "Manhã seca, madeira clara e uma fruta que ninguém consegue nomear de primeira.",
        "story": "A goiaba no coração é o que torna este diferente: uma fruta inesperada entre cardamomo e lavanda. O fundo de palo santo e incenso é seco, quase mineral — o oposto dos orientais doces da casa.",
        "perception": {
            "opens": "Bergamota e cardamomo, com pimenta rosa por cima.",
            "becomes": "Goiaba e gengibre dão um centro frutado e ligeiramente picante.",
            "ends": "Palo santo, incenso e sândalo secam tudo até uma madeira clara.",
        },
        "recommendedFor": "Quem já tem os orientais doces e quer algo seco e diferente. Funciona bem no calor.",
        "notFor": "Se você gosta de perfume doce e envolvente, vai achar este seco demais.",
        "map": {"x": 0.42, "y": 0.38},
    },
    "club-de-nuit-intense": {
        "brand": "Armaf", "gender": "masculino", "concentration": "EDT", "volumeMl": 105,
        "families": ["Amadeirado", "Frutado", "Aromático"],
        "notes": {
            "top": ["Limão", "Abacaxi", "Bergamota", "Cassis", "Maçã"],
            "heart": ["Bétula", "Jasmim", "Rosa"],
            "base": ["Almíscar", "Âmbar Cinzento", "Patchouli", "Baunilha"],
        },
        "accords": [("Amadeirado", 26), ("Frutado", 24), ("Cítrico", 20), ("Âmbar · Resina", 16), ("Almiscarado", 14)],
        "personality": ["Marcante", "Fumegante", "Clássico"],
        "profile": {"intensity": 5, "projection": 5, "longevity": 4},
        "occasions": ["Noite", "Evento", "Encontro"], "moments": ["tarde", "noite"], "climates": ["ameno", "frio"],
        "tagline": "O abacaxi mais famoso da perfumaria árabe.",
        "atmosphere": "Abacaxi sobre madeira queimada. Entra na sala antes de você.",
        "story": "Abre com abacaxi e cítricos que todo mundo reconhece, e logo aparece a bétula defumada por baixo — é esse contraste entre fruta e fumaça que fez a fama dele. O fundo de âmbar cinzento e almíscar é o que sustenta a projeção.",
        "perception": {
            "opens": "Abacaxi, limão e cassis — uma abertura afiada e brilhante.",
            "becomes": "Bétula defumada surge por baixo da fruta e muda o rumo.",
            "ends": "Âmbar cinzento, almíscar e patchouli deixam um rastro longo.",
        },
        "recommendedFor": "Quem quer presença imediata e não se importa de usar algo reconhecível. Projeta muito com poucas borrifadas.",
        "notFor": "Se você trabalha em ambiente fechado ou prefere passar despercebido, evite. Ele é alto e as pessoas notam.",
        "map": {"x": 0.72, "y": 0.45},
        "note_version": "A planilha traz apenas 'Club de Nuit Intense'. Usei as notas da versão EDT, a mais comum. Existem também Parfum e Extrait, com notas diferentes.",
    },
    "afnan-9pm": {
        "brand": "Afnan", "gender": "masculino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Oriental", "Gourmand", "Aromático"],
        "notes": {
            "top": ["Lavanda Selvagem", "Maçã", "Bergamota", "Canela"],
            "heart": ["Lírio-do-vale", "Flor de Laranjeira"],
            "base": ["Âmbar", "Patchouli", "Fava Tonka", "Baunilha"],
        },
        "accords": [("Gourmand · Doce", 30), ("Baunilha", 24), ("Aromático", 18), ("Âmbar · Resina", 16), ("Frutado", 12)],
        "personality": ["Doce", "Noturno", "Jovem"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Noite", "Encontro", "Evento"], "moments": ["noite"], "climates": ["ameno", "frio"],
        "tagline": "Baunilha e lavanda. O doce que funciona em homem.",
        "atmosphere": "Saída à noite, jaqueta fechada, algo adocicado que fica no colarinho no dia seguinte.",
        "story": "Lavanda e maçã na entrada, baunilha e tonka no fundo — uma combinação que virou padrão de perfume masculino doce. A canela no topo dá o calor que impede de ficar enjoativo.",
        "perception": {
            "opens": "Maçã e bergamota com lavanda e um toque de canela.",
            "becomes": "Flores brancas suavizam o centro por pouco tempo.",
            "ends": "Baunilha, tonka e âmbar assumem e ficam por horas.",
        },
        "recommendedFor": "Quem quer um doce fácil de gostar para sair à noite. É dos mais elogiados por quem está perto.",
        "notFor": "Se você não gosta de perfume adocicado ou precisa de algo sóbrio para o dia, procure outro.",
        "map": {"x": 0.70, "y": 0.85},
    },
    "yara-candy": {
        "brand": "Lattafa", "gender": "feminino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Frutado", "Gourmand", "Floral"],
        "notes": {
            "top": ["Cassis", "Tangerina Verde"],
            "heart": ["Bala de Morango", "Gardênia"],
            "base": ["Baunilha", "Almíscar", "Âmbar", "Sândalo"],
        },
        "accords": [("Frutado", 30), ("Gourmand · Doce", 26), ("Baunilha", 20), ("Floral", 14), ("Almiscarado", 10)],
        "personality": ["Divertido", "Doce", "Jovem"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Dia", "Encontro", "Trabalho"], "moments": ["manhã", "tarde"], "climates": ["quente", "ameno"],
        "tagline": "Bala de morango, sem pedir desculpa por isso.",
        "atmosphere": "Tarde clara, riso alto e alguma coisa de morango que ninguém consegue ignorar.",
        "story": "Cassis e tangerina abrem, e o coração é literalmente bala de morango com gardênia. O fundo de baunilha e sândalo é o que dá alguma seriedade — sem ele seria só açúcar.",
        "perception": {
            "opens": "Cassis e tangerina verde, ácidos e brilhantes.",
            "becomes": "Morango doce toma conta, com gardênia por baixo.",
            "ends": "Baunilha, âmbar e sândalo deixam um fundo cremoso.",
        },
        "recommendedFor": "Quem gosta de doce assumido e quer ser lembrada pelo cheiro. Funciona bem de dia e no calor.",
        "notFor": "Se você procura algo sóbrio, amadeirado ou discreto, este vai parecer infantil.",
        "map": {"x": 0.45, "y": 0.92},
    },
    "club-de-nuit-maleka": {
        "brand": "Armaf", "gender": "feminino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Floral", "Frutado", "Gourmand"],
        "notes": {
            "top": ["Lichia", "Bergamota", "Pimenta Rosa"],
            "heart": ["Íris"],
            "base": ["Pralinê", "Ambroxan", "Sândalo"],
        },
        "accords": [("Floral", 28), ("Frutado", 24), ("Gourmand · Doce", 20), ("Amadeirado", 16), ("Âmbar · Resina", 12)],
        "personality": ["Elegante", "Luminoso", "Macio"],
        "profile": {"intensity": 3, "projection": 3, "longevity": 4},
        "occasions": ["Dia", "Encontro", "Evento"], "moments": ["manhã", "tarde", "noite"], "climates": ["ameno", "quente"],
        "tagline": "Lichia e íris. Doce de gente grande.",
        "atmosphere": "Pele limpa, pó de arroz e uma fruta clara que some devagar.",
        "story": "Assinado por Olivier Cresp, abre com lichia e bergamota e se apoia numa íris empoada no centro. O pralinê no fundo adoça sem virar sobremesa — é doce contido, não gourmand.",
        "perception": {
            "opens": "Lichia e bergamota, com pimenta rosa dando o brilho.",
            "becomes": "Íris empoada toma o centro e acalma a fruta.",
            "ends": "Pralinê, ambroxan e sândalo deixam um fundo macio e quente.",
        },
        "recommendedFor": "Quem quer algo feminino e elegante que sirva do dia à noite sem trocar de perfume.",
        "notFor": "Se você quer presença forte e rastro longo, este é contido demais.",
        "map": {"x": 0.40, "y": 0.72},
    },
    "vulcan-feu": {
        "brand": "French Avenue", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Floral", "Frutado", "Amadeirado"],
        "notes": {
            "top": ["Gengibre", "Manga", "Limão", "Ruibarbo"],
            "heart": ["Jasmim", "Violeta", "Pralinê", "Pimenta Rosa"],
            "base": ["Cedro", "Âmbar Cinzento", "Fava Tonka", "Musgo"],
        },
        "accords": [("Frutado", 26), ("Floral", 24), ("Amadeirado", 20), ("Gourmand · Doce", 18), ("Especiado", 12)],
        "personality": ["Vibrante", "Solar", "Inesperado"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Dia", "Encontro", "Evento"], "moments": ["manhã", "tarde"], "climates": ["quente", "ameno"],
        "tagline": "Manga e gengibre sobre madeira. Não se parece com nada da casa.",
        "atmosphere": "Calor de fim de tarde, fruta madura e um fundo de madeira úmida.",
        "story": "Manga, gengibre e ruibarbo abrem de forma quase agressiva de tão viva. O coração floral com pralinê segura o exagero, e o fundo de cedro e musgo dá terra a uma fragrância que começou solar.",
        "perception": {
            "opens": "Manga, gengibre e limão — uma entrada ácida e quente ao mesmo tempo.",
            "becomes": "Jasmim, violeta e pralinê arredondam tudo.",
            "ends": "Cedro, tonka e musgo deixam um fundo terroso e morno.",
        },
        "recommendedFor": "Quem quer fugir do óbvio e não tem medo de fruta. É o mais original da curadoria.",
        "notFor": "Se você prefere perfumes clássicos e previsíveis, este vai soar estranho nas primeiras vezes.",
        "map": {"x": 0.50, "y": 0.70},
    },
    "vulcan-sable": {
        "brand": "French Avenue", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Aromático", "Gourmand", "Oriental"],
        "notes": {
            "top": ["Uísque", "Laranja", "Tangerina", "Coentro"],
            "heart": ["Fava Tonka", "Cashmeran", "Estoraque", "Anis"],
            "base": ["Baunilha", "Patchouli", "Benjoim"],
        },
        "accords": [("Gourmand · Doce", 26), ("Baunilha", 24), ("Especiado", 20), ("Âmbar · Resina", 18), ("Cítrico", 12)],
        "personality": ["Adulto", "Quente", "Embriagante"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 5},
        "occasions": ["Noite", "Jantar", "Evento"], "moments": ["noite"], "climates": ["frio", "ameno"],
        "tagline": "Uísque, anis e baunilha. Um perfume de fim de noite.",
        "atmosphere": "Copo baixo, luz âmbar, conversa que já passou da hora de acabar.",
        "story": "A nota de uísque na abertura é rara e é o que define ele. Anis e estoraque no centro puxam para o licoroso, e o fundo de baunilha e benjoim fecha tudo com uma doçura resinosa que demora a ir embora.",
        "perception": {
            "opens": "Uísque e laranja, com coentro cortando a doçura.",
            "becomes": "Anis e cashmeran deixam o centro quente e levemente licoroso.",
            "ends": "Baunilha, patchouli e benjoim seguram por muitas horas.",
        },
        "recommendedFor": "Quem gosta de fragrâncias quentes e adultas para a noite. É dos que mais duram da curadoria.",
        "notFor": "Se você quer algo leve, fresco ou para usar de dia, este é pesado demais.",
        "map": {"x": 0.78, "y": 0.75},
    },
    "liquid-brun": {
        "brand": "French Avenue", "gender": "masculino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Amadeirado", "Gourmand", "Especiado"],
        "notes": {
            "top": ["Canela", "Flor de Laranjeira", "Cardamomo", "Bergamota"],
            "heart": ["Baunilha Bourbon", "Elemi"],
            "base": ["Pralinê", "Ambroxan", "Almíscar", "Madeira Guaiac"],
        },
        "accords": [("Baunilha", 26), ("Amadeirado", 24), ("Gourmand · Doce", 22), ("Especiado", 18), ("Almiscarado", 10)],
        "personality": ["Cremoso", "Sóbrio", "Envolvente"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Noite", "Trabalho", "Encontro"], "moments": ["tarde", "noite"], "climates": ["frio", "ameno"],
        "tagline": "Baunilha com madeira, na medida em que homem usa.",
        "atmosphere": "Couro de carro no frio, canela e uma baunilha que não é de sobremesa.",
        "story": "Canela e cardamomo abrem especiados, a baunilha bourbon assume o centro e o fundo de madeira guaiac e ambroxan segura tudo. É doce, mas o amadeirado impede que passe de gourmand masculino para sobremesa.",
        "perception": {
            "opens": "Canela e cardamomo sobre bergamota.",
            "becomes": "Baunilha bourbon cremosa toma o centro.",
            "ends": "Pralinê, madeira guaiac e almíscar deixam um fundo quente e seco.",
        },
        "recommendedFor": "Quem quer baunilha sem parecer doce demais. Funciona no trabalho no frio e à noite o ano todo.",
        "notFor": "Se você procura frescor ou cítricos, não é aqui. Ele é quente do começo ao fim.",
        "map": {"x": 0.72, "y": 0.80},
    },
    "eclaire": {
        "brand": "Lattafa", "gender": "feminino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Gourmand", "Floral", "Frutado"],
        "notes": {
            "top": ["Caramelo", "Leite", "Açúcar"],
            "heart": ["Flores Brancas", "Mel"],
            "base": ["Baunilha", "Pralinê", "Almíscar"],
        },
        "accords": [("Gourmand · Doce", 34), ("Baunilha", 26), ("Floral", 18), ("Almiscarado", 12), ("Frutado", 10)],
        "personality": ["Cremoso", "Acolhedor", "Doce"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Dia", "Encontro", "Trabalho"], "moments": ["manhã", "tarde", "noite"], "climates": ["frio", "ameno"],
        "tagline": "Caramelo, leite e mel. Confeitaria, sem meio-termo.",
        "atmosphere": "Cozinha quente de manhã cedo: leite no fogo, caramelo e mel na colher.",
        "story": "É gourmand puro e não finge outra coisa. Caramelo, leite e açúcar na abertura, mel e flores brancas no centro, baunilha e pralinê no fundo. O almíscar é o único elemento que não é doce — e é ele que mantém o conjunto vestível.",
        "perception": {
            "opens": "Caramelo e leite, quase comestível.",
            "becomes": "Mel e flores brancas dão um centro mais redondo.",
            "ends": "Baunilha, pralinê e almíscar deixam um fundo cremoso e morno.",
        },
        "recommendedFor": "Quem ama doce de verdade e quer um perfume aconchegante. Rende muito no frio.",
        "notFor": "Se doce te enjoa, ou se você precisa de algo neutro em ambiente fechado, passe longe deste.",
        "map": {"x": 0.55, "y": 0.95},
    },
    "hawas-kobra": {
        "brand": "Rasasi", "gender": "masculino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Cítrico", "Amadeirado", "Especiado"],
        "notes": {
            "top": ["Gengibre", "Tangerina", "Bergamota"],
            "heart": ["Canela", "Chá Verde", "Neroli"],
            "base": ["Âmbar", "Almíscar", "Notas Amadeiradas"],
        },
        "accords": [("Cítrico", 28), ("Amadeirado", 22), ("Especiado", 20), ("Âmbar · Resina", 18), ("Almiscarado", 12)],
        "personality": ["Fresco", "Elegante", "Luminoso"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 5},
        "occasions": ["Dia", "Trabalho", "Encontro", "Evento"], "moments": ["manhã", "tarde"], "climates": ["quente", "ameno"],
        "tagline": "Cítrico com chá verde. Fresco que dura a noite inteira.",
        "atmosphere": "Manhã de sol, casca de tangerina e chá servido forte.",
        "story": "Gengibre e tangerina abrem cítricos e vivos, o chá verde no centro dá elegância, e o fundo de âmbar e almíscar é o que faz um perfume fresco durar como um oriental. Essa combinação é incomum e é o que o torna interessante.",
        "perception": {
            "opens": "Gengibre e tangerina, cítricos e picantes.",
            "becomes": "Chá verde e neroli formam um centro limpo e elegante.",
            "ends": "Âmbar e almíscar sustentam por muito mais tempo do que um cítrico costuma durar.",
        },
        "recommendedFor": "Quem quer frescor sem abrir mão de fixação. É o melhor da curadoria para clima quente.",
        "notFor": "Se você procura algo doce, escuro ou noturno, este vai parecer leve demais.",
        "map": {"x": 0.35, "y": 0.35},
        "note_version": "Fontes da comunidade relatam dez a doze horas de duração e projeção alta nas primeiras horas.",
    },
    "fakhar-gold": {
        "brand": "Lattafa", "gender": "unissex", "concentration": "EDP", "volumeMl": 100,
        "families": ["Amadeirado", "Âmbar", "Floral"],
        "notes": {
            "top": ["Tuberosa", "Sal"],
            "heart": ["Âmbar", "Cashmeran", "Fava Tonka"],
            "base": ["Cedro", "Vetiver", "Labdanum"],
        },
        "accords": [("Âmbar · Resina", 28), ("Amadeirado", 26), ("Floral", 18), ("Baunilha", 16), ("Almiscarado", 12)],
        "personality": ["Mineral", "Quente", "Sofisticado"],
        "profile": {"intensity": 4, "projection": 3, "longevity": 4},
        "occasions": ["Noite", "Evento", "Encontro"], "moments": ["tarde", "noite"], "climates": ["ameno", "frio"],
        "tagline": "Sal e tuberosa sobre âmbar. Estranho no bom sentido.",
        "atmosphere": "Ar de praia à noite: sal na pele, flor pesada e madeira seca.",
        "story": "A nota de sal na abertura é o que chama atenção — junto de tuberosa, cria um contraste mineral e floral raro. O fundo de cedro, vetiver e labdanum é seco e resinoso, bem distante dos doces da casa.",
        "perception": {
            "opens": "Tuberosa e sal, floral e mineral ao mesmo tempo.",
            "becomes": "Âmbar e cashmeran esquentam o centro.",
            "ends": "Cedro, vetiver e labdanum secam até uma base resinosa.",
        },
        "recommendedFor": "Quem já conhece perfumaria e procura algo fora do lugar-comum.",
        "notFor": "Se esta é sua primeira incursão em perfume árabe, comece por outro. Este pede um nariz acostumado.",
        "map": {"x": 0.68, "y": 0.45},
    },
    "al-wesal": {
        "brand": "Al Wataniah", "gender": "unissex", "concentration": None, "volumeMl": None,
        "families": ["Oriental", "Especiado", "Aromático"],
        "notes": {
            "top": ["Lavanda", "Pera", "Menta", "Bergamota", "Limão"],
            "heart": ["Canela", "Sálvia Esclareia", "Cominho"],
            "base": ["Baunilha Negra", "Âmbar", "Cedro", "Patchouli"],
        },
        "accords": [("Especiado", 26), ("Aromático", 22), ("Baunilha", 20), ("Âmbar · Resina", 18), ("Cítrico", 14)],
        "personality": ["Tradicional", "Quente", "Especiado"],
        "profile": {"intensity": 4, "projection": 3, "longevity": 4},
        "occasions": ["Noite", "Encontro"], "moments": ["tarde", "noite"], "climates": ["frio", "ameno"],
        "tagline": "Especiaria e baunilha, no estilo antigo.",
        "atmosphere": "Casa cheia no inverno, canela no ar e alguma coisa de baunilha vindo da cozinha.",
        "story": "Um oriental especiado à moda antiga: lavanda e menta abrem frescas, canela e cominho tomam o centro, e o fundo de baunilha negra com âmbar é o que sustenta. Não tenta ser moderno — e é esse o apelo.",
        "perception": {
            "opens": "Lavanda, menta e cítricos, uma entrada mais fresca do que o resto sugere.",
            "becomes": "Canela e cominho esquentam rápido e mudam o caráter.",
            "ends": "Baunilha negra, âmbar e patchouli deixam um fundo espesso.",
        },
        "recommendedFor": "Quem gosta do perfume árabe tradicional, especiado e quente.",
        "notFor": "Se você procura algo moderno, limpo ou fresco, este soa antiquado — de propósito.",
        "map": {"x": 0.62, "y": 0.58},
        "note_version": "ATENÇÃO: a identificação deste é incerta. Encontrei 'Attar Al Wesal', da Al Wataniah, e usei os dados dele. Se o seu for outro produto, me avise que eu corrijo.",
    },
    "mandarin-sky": {
        "brand": "Armaf", "gender": "masculino", "concentration": "EDP", "volumeMl": 100,
        "families": ["Cítrico", "Gourmand", "Amadeirado"],
        "notes": {
            "top": ["Tangerina", "Laranja", "Açafrão", "Sálvia"],
            "heart": ["Caramelo", "Fava Tonka", "Calêndula"],
            "base": ["Vetiver", "Cedro", "Ambroxan"],
        },
        "accords": [("Cítrico", 26), ("Gourmand · Doce", 24), ("Amadeirado", 22), ("Especiado", 16), ("Baunilha", 12)],
        "personality": ["Solar", "Doce", "Versátil"],
        "profile": {"intensity": 4, "projection": 4, "longevity": 4},
        "occasions": ["Dia", "Trabalho", "Encontro"], "moments": ["manhã", "tarde"], "climates": ["quente", "ameno"],
        "tagline": "Tangerina com caramelo. Doce que funciona de dia.",
        "atmosphere": "Sol da manhã, casca de laranja e algo caramelizado ao fundo.",
        "story": "Tangerina e laranja abrem cítricas, mas o caramelo e a tonka no centro mudam o jogo — vira um cítrico gourmand, combinação que funciona melhor do que parece. O açafrão dá a especiaria que impede de ficar simples.",
        "perception": {
            "opens": "Tangerina e laranja com açafrão por cima.",
            "becomes": "Caramelo e tonka adoçam e esquentam o centro.",
            "ends": "Vetiver, cedro e ambroxan secam o fundo.",
        },
        "recommendedFor": "Quem quer um doce que dê para usar de dia e no calor sem pesar.",
        "notFor": "Se você não gosta da mistura de cítrico com doce, este vai soar confuso.",
        "map": {"x": 0.58, "y": 0.72},
        "note_version": "Nome completo do produto: Odyssey Mandarin Sky, da Armaf.",
    },
}


def main():
    apply = "--aplicar" in sys.argv
    perfumes = json.loads(CATALOG.read_text(encoding="utf8"))
    by_slug = {p["slug"]: p for p in perfumes}

    applied, missing = [], []

    for slug, data in RESEARCH.items():
        p = by_slug.get(slug)
        if not p:
            missing.append(slug)
            continue

        for key in ("brand", "gender", "families", "notes", "personality", "profile",
                    "occasions", "moments", "climates", "tagline", "atmosphere",
                    "story", "perception", "recommendedFor", "notFor", "map"):
            if key in data and data[key] is not None:
                p[key] = data[key]

        for key in ("concentration", "volumeMl"):
            if data.get(key) is not None and p.get(key) is None:
                p[key] = data[key]

        if "accords" in data:
            p["accords"] = [{"label": label, "weight": weight} for label, weight in data["accords"]]

        if "note_version" in data:
            p["sourceNote"] = data["note_version"]

        p["review"] = SUBJECTIVE + (["identificacao"] if "note_version" in data else [])
        applied.append(p["name"])

    print(f"{len(applied)} perfumes enriquecidos")
    for n in applied:
        print(f"   ~ {n}")
    if missing:
        print(f"\n⚠ slug não encontrado: {', '.join(missing)}")

    ready = sum(1 for p in perfumes if p.get("families") and p.get("personality") and p.get("profile"))
    print(f"\nperfil completo: {ready} de {len(perfumes)}")

    if apply:
        CATALOG.write_text(json.dumps(perfumes, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        print(f"✓ {CATALOG.relative_to(ROOT)} atualizado")
    else:
        print("(simulação — rode com --aplicar para gravar)")


if __name__ == "__main__":
    main()
