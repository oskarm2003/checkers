let game;
let net;
let ui;
let logic

const player = {
    username: null,
    role: null,
    selectedPawn: null
}

const gameplay = {
    started: false,
    turn: null
}

const session = {
    type: null,
    id: null,
    user1: null,
    user2: null
}

const settings = {
    opened: false,
    highlight: true,
    view2D: false,
    ambientLight: false,
    theme: 0,

}

const theme = {
    background: [0x0f0f0f, 0x40175c, 0x121a04, 0x1f2211, 0xff3030],
    black_pawn: [0x912c2c, 0x9fff9f, 0x271633, 0x111111, 0x30ff30],
    white_pawn: [0xedc99d, 0x9fffff, 0x8f5504, 0xdddddd, 0x3030ff],
    black_tile: [0x000000, 0x4a0c37, 0x1a0202, 0x333333, 0x777777],
    white_tile: [0xffffff, 0xffffff, 0x3b3232, 0xaaaaaa, 0xcfcfcf],
    tile_highlight: [0xcfffcf, 0xdfbfdf, 0xffffff, 0xffffff, 0xffffff],
    pawn_highlight: [0xffffff, "wireframe"]
}

window.onload = () => {

    game = new Game();
    net = new Net();
    ui = new Ui(document.getElementById("login"));
    logic = new Logic();
}