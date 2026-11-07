# CheckManager Mobile

Aplicativo de controle de estoque em JavaScript, React Native e Expo. Permite cadastrar produtos, acompanhar níveis e validades, registrar entradas e saídas e consultar produtos por código de barras.

## Executar no Expo Go

Requisitos: Node.js LTS, npm e Expo Go no celular.

```bash
npm install
npx expo start
```

Escaneie o QR exibido no terminal com o Expo Go. Para celulares que não estejam na mesma rede Wi-Fi, use `npx expo start --tunnel`.

## API e armazenamento

A consulta por código de barras usa a API HTTPS pública do [Open Food Facts](https://world.openfoodfacts.org/), em `https://world.openfoodfacts.org/api/v3.6/product/{codigo}.json`. A integração está centralizada em `src/services/api.js` e inclui timeout e tratamento de erros.

Para configurar outro endpoint compatível, copie `.env.example` para `.env`, ajuste `EXPO_PUBLIC_API_URL` e reinicie o Expo. Essa variável é pública e não deve conter segredos.

Produtos, preços, custos e movimentações são salvos no aparelho via AsyncStorage. O Open Food Facts fornece dados de catálogo; o projeto não inclui um backend para sincronizar estoques entre dispositivos.

## Funcionalidades

- Dashboard com alertas de estoque e validade
- Cadastro, edição, busca e filtros de produtos
- Leitura de código de barras e consulta ao catálogo online
- Registro e histórico de entradas e saídas
- Análises financeiras, de categorias e de performance
- Importação/exportação CSV e relatórios CSV/PDF

## Organização

```text
src/
├── App.js                    # Ponto de entrada
├── AppNavigator.js           # Navegação e ações principais
├── AppNavigator.styles.js
├── components/               # Componentes reutilizados e estilos
├── hooks/useInventory.js     # Estado e persistência do estoque
├── screens/                  # Uma tela por arquivo
├── services/                 # API e exportação/impressão
├── utils/                    # CSV, métricas e formatação
├── theme.js                  # Cores, tipografia e espaçamentos
└── assets/images/
```

Adicione telas em `src/screens`, componentes compartilhados em `src/components`, chamadas externas em `src/services` e regras auxiliares em `src/utils`.

## Verificações

```bash
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform android
```
