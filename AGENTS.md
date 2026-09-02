## 📱 Padrão Bancada Mobile Pro (Mobile-First Compact Tech)
Sempre que for solicitado otimizar telas com o **Padrão Bancada Mobile Pro**, siga rigorosamente estas diretrizes no mobile (`< sm`):
1. **Títulos e Banners de Páginas**: SEMPRE ocultar títulos e banners descritivos de páginas (`hidden sm:flex` / `hidden sm:block`) no mobile (ex: Dashboard, Ordens, Clientes, Estoque, Relatórios, Garantias, Formulários de Nova OS, Novo Cliente, etc.).
2. **Cards de Métricas e KPIs**: SEMPRE ocultar os cards de métricas/KPIs no mobile (`hidden sm:grid`) para que o usuário veja diretamente a listagem e os filtros sem rolagem excessiva.
3. **Botão de Nova OS e Atalhos no Header Superior**: SEMPRE ocultar no mobile (`hidden sm:flex`), pois a criação de ordens e atalhos já ficam centralizados na **Tabbar Inferior (`MobileNav`)**.
4. **Detalhes da Ordem (`OrderDetails`) no Mobile**:
   * **Header Compacto**: Sem duplicação de botões (ex: "Editar"). Linha de status + recibo + barra de ações enxuta (*Rastreio, Etiqueta, Editar, Excluir*).
   * **Slim Stepper Horizontal**: Barra horizontal compacta e interativa (~35-40px) no lugar do stepper vertical volumoso.
   * **Card do Cliente & Aparelho**: Layout direto com atalho imediato de WhatsApp/Ligação.
   * **Alteração de Status via BottomSheet**: No mobile, a seleção rápida de status pela badge SEMPRE abre via **BottomSheet** nativo deslizante com drag-to-dismiss.
5. **Sidebar**: NUNCA alterar ou quebrar a estrutura da Sidebar.
