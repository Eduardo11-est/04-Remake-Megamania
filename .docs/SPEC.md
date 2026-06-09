# SPEC.md

##  Modern Space Shooter (Shmup) Specification

### Objetivo do Jogo

O jogador controla uma nave posicionada na parte inferior da tela, com movimentação exclusivamente horizontal, enfrentando ondas progressivas de inimigos que descem do topo. O objetivo é sobreviver o máximo possível, destruir inimigos e alcançar a maior pontuação.

---

##  Mecânicas Principais

### Controle do Jogador

* Movimento lateral suave e responsivo (esquerda/direita).
* Disparo vertical contínuo ou semi-automático.
* Projéteis rápidos com feedback visual claro (trail ou brilho).

**Suporte a controles:**

* Desktop: teclado (setas ou A/D + espaço).
* Mobile: touch (botões virtuais, swipe ou joystick).

---

##  Sistema de Energia (Combustível)

* Barra de energia que diminui continuamente ao longo do tempo.
* Destruir uma onda completa restaura parcialmente ou totalmente a energia.
* Ao zerar:

  * Jogador perde uma vida.
* Ao avançar de fase:

  * Energia totalmente restaurada.

**Feedback visual:**

* Piscar ou mudança de cor quando energia estiver baixa.

---

##  Inimigos

* Surgem no topo da tela em formações organizadas.

**Padrões de movimento:**

* Zigue-zague horizontal.
* Descida lenta em fileiras.

**Ataque:**

* Disparo ocasional de projéteis (baixo volume).
* Máximo de 1 projétil ativo por inimigo.

**Colisão:**

* Contato direto destrói a nave do jogador.

---

##  Ondas e Progressão Visual

A cada nível, o tema visual dos inimigos muda:

1. Hambúrgueres voadores
2. Bolachas/Biscoitos
3. Ferros de passar roupa
4. Gravatas borboleta
5. Diamantes

* Após completar o ciclo, repetir com dificuldade aumentada.

---

##  Estética e Áudio

###  Visual

* Estilo Pixel Art 8-bit.
* Baixa resolução intencional.
* Paleta vibrante contrastando com fundo de galáxia.
* Animações simples porém expressivas (explosões, dano, tiros).

###  Áudio

* Tiro: som agudo estilo laser retrô.
* Destruição: som explosivo/crushing.
* Opcional: música de fundo looping estilo chiptune.

---

##  Interface (UI/HUD)

**Topo:**

* Pontuação (Score)
* Número de vidas

**Parte inferior:**

* Barra de energia/combustível

**Feedback adicional:**

* Flash na tela ao sofrer dano
* Indicadores visuais de progresso de fase

---

##  Lógica de Jogo e Progressão

* A cada nível:

  * Aumentar velocidade dos inimigos
  * Aumentar levemente a frequência de ataque

**Sistema de colisão:**

* Preciso e justo (hitboxes consistentes com pixel art)

**Loop de gameplay:**

* Sobrevivência + progressão infinita (ou até derrota)

---

##  Melhorias Modernas

* Animações mais suaves (mantendo pixel art)
* Feedback visual mais rico (partículas, impactos)
* Screen shake ao destruir inimigos
* Sistema de pontuação com multiplicador (combo opcional)
* Salvamento de high score local

---

##  Plataforma e Saída

Compatível com:

* Desktop (navegador ou executável)
* Mobile (responsivo ou app híbrido)

Deve:

* Adaptar interface para toque
* Escalar automaticamente para diferentes telas
* Manter performance leve e fluida

---

##  Requisitos Técnicos

Pode ser implementado em:

* HTML5 + Canvas/WebGL
* Unity (2D)
* Godot

**Arquitetura modular:**

* Player
* Inimigos
* Sistema de ondas
* UI/HUD
* Áudio

---
