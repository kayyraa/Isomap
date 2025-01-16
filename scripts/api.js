window.Color = null;

export const Scene = document.querySelector(".Scene");
export const Toolbar = document.querySelector(".Toolbar");

export class Vector2 {
    constructor(Vector = [0, 0]) {
        this.Vector = Vector;
    }
}

export class Block {
    constructor(Appearance = {
        Color: "rgb(80, 40, 120)",
        Texture: ""
    }, Position = new Vector2([0, 0])) {
        this.Color = Appearance.Color;
        this.Position = Position.Vector;
    }

    Append() {
        const Block = document.createElement("div");
        Block.style.left = `${this.Position[0]}px`;
        Block.style.top = `${this.Position[1]}px`;
        Block.style.zIndex = Scene.children.length - 1;
        const Projection = document.createElement("div");

        const ColorArray = this.Color.replace("rgb(", "").replace(")", "").split(",").map(Number);
        const Shadow = `rgb(${ColorArray[0] - 50}, ${ColorArray[1] - 50}, ${ColorArray[2] - 50})`;
        const Origin = `rgb(${ColorArray[0]}, ${ColorArray[1]}, ${ColorArray[2]})`;

        for (let Layer = 0; Layer < 32; Layer++) {
            const ShadowLayer = document.createElement("div");
            ShadowLayer.style.left = `${64 - 38 - (Layer / 2) + 22}px`;
            ShadowLayer.style.bottom = "-16px";
            ShadowLayer.style.width = `${68 - (Layer / 2)}%`;
            ShadowLayer.style.height = `${(Layer / 2) * 2}px`;
            ShadowLayer.style.zIndex = "-2";
            ShadowLayer.style.background = "rgb(70, 70, 70)";
            //Projection.appendChild(ShadowLayer);
        }

        for (let Layer = 0; Layer < 16; Layer++) {
            const BottomRightSide = document.createElement("div");
            BottomRightSide.style.right = `${Layer * 2}px`;
            BottomRightSide.style.bottom = `${-Layer}px`;
            BottomRightSide.style.background = Shadow;
            Projection.appendChild(BottomRightSide);

            const BottomLeftSide = document.createElement("div");
            BottomLeftSide.style.left = `${Layer * 2}px`;
            BottomLeftSide.style.top = `${Layer}px`;
            BottomLeftSide.style.background = Origin;
            Projection.appendChild(BottomLeftSide);

            const TopRightSide = document.createElement("div");
            TopRightSide.style.left = `${Layer * 2}px`;
            TopRightSide.style.bottom = `${Layer}px`;
            TopRightSide.style.background = Origin;
            TopRightSide.height = `${Layer}px`;
            TopRightSide.classList.add("TopLayer");
            Projection.appendChild(TopRightSide);

            const TopLeftSide = document.createElement("div");
            TopLeftSide.style.right = `${Layer * 2}px`;
            TopLeftSide.style.bottom = `${Layer}px`;
            TopLeftSide.style.background = Origin;
            TopLeftSide.height = `${Layer}px`;
            TopLeftSide.classList.add("TopLayer");
            Projection.appendChild(TopLeftSide);
        }

        Block.appendChild(Projection);
        Scene.appendChild(Block);
        this.Block = Block;
    }

    Remove() {
        if (!this.Block) return;
        this.Block.remove();
    }
}

export class PerlinNoise {
    constructor() {
        this.Gradient = {};
    }

    DotGridGradient(IX, IY, X, Y) {
        if (!this.Gradient[`${IX},${IY}`]) {
            const Angle = Math.random() * Math.PI * 2;
            this.Gradient[`${IX},${IY}`] = [Math.cos(Angle), Math.sin(Angle)];
        }
        const Gradient = this.Gradient[`${IX},${IY}`];
        const DX = X - IX;
        const DY = Y - IY;
        return DX * Gradient[0] + DY * Gradient[1];
    }

    Generate(X, Y) {
        const X0 = Math.floor(X);
        const X1 = X0 + 1;
        const Y0 = Math.floor(Y);
        const Y1 = Y0 + 1;

        const SX = X - X0;
        const SY = Y - Y0;

        const N0 = this.DotGridGradient(X0, Y0, X, Y);
        const N1 = this.DotGridGradient(X1, Y0, X, Y);
        const IX0 = (1 - SX) * N0 + SX * N1;

        const N2 = this.DotGridGradient(X0, Y1, X, Y);
        const N3 = this.DotGridGradient(X1, Y1, X, Y);
        const IX1 = (1 - SX) * N2 + SX * N3;

        return (1 - SY) * IX0 + SY * IX1;
    }
}

export function CreateBulkBlocks(Layers, OffsetX, OffsetY, XMultiplier = 1, YMultiplier = 1, YAdjustment = 0) {
    for (let Layer = 0; Layer < Layers; Layer++) {
        if (Layer === 0 && (OffsetX !== 0 || OffsetY !== 0)) continue;
        const SnappedX = OffsetX + Layer * XMultiplier;
        const SnappedY = OffsetY + Layer * YMultiplier + YAdjustment;
        new Block({
            Color: window.Color || `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
        }, new Vector2([SnappedX, SnappedY])).Append();
    }
}

Array.from(Toolbar.children).forEach(Block => {
    Block.addEventListener("click", () => {
        window.Color = Block.getAttribute("color");
    });
});

Scene.addEventListener("mousedown", (Event) => {
    const SnappedX = Math.round((Event.clientX - 16) / 16) * 16;
    const SnappedY = Math.round((Event.clientY - 16) / 16) * 16;

    new Block({
        Color: window.Color || `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
    }, new Vector2([SnappedX, SnappedY])).Append();
});

let IsMoving = false;
document.addEventListener("mousemove", (Event) => {
    if (IsMoving) return;
    IsMoving = true;

    const SnappedX = Math.round((Event.clientX - 16) / 16) * 16;
    const SnappedY = Math.round((Event.clientY - 16) / 16) * 16;

    let Visualiser = document.querySelector(".Visualiser");
    if (!Visualiser) {
        Visualiser = document.createElement("div");
        Visualiser.classList.add("Visualiser");
        Scene.appendChild(Visualiser);
    }

    Visualiser.style.left = `${SnappedX}px`;
    Visualiser.style.top = `${SnappedY}px`;
    Visualiser.style.zIndex = Scene.children.length + 1;
    Toolbar.style.zIndex = Scene.children.length + 2;

    const Projection = Visualiser.querySelector(".Projection") || document.createElement("div");
    Projection.classList.add("Projection");

    Projection.innerHTML = "";
    for (let Layer = 0; Layer < 16; Layer++) {
        const BottomRightSide = document.createElement("div");
        BottomRightSide.style.right = `${Layer * 2}px`;
        BottomRightSide.style.bottom = `${Layer * -1}px`;
        Projection.appendChild(BottomRightSide);

        const BottomLeftSide = document.createElement("div");
        BottomLeftSide.style.left = `${Layer * 2}px`;
        BottomLeftSide.style.top = `${Layer * 1}px`;
        Projection.appendChild(BottomLeftSide);

        const TopRightSide = document.createElement("div");
        TopRightSide.style.left = `${Layer * 2}px`;
        TopRightSide.style.bottom = `${Layer}px`;
        TopRightSide.height = `${Layer}px`;
        Projection.appendChild(TopRightSide);

        const TopLeftSide = document.createElement("div");
        TopLeftSide.style.right = `${Layer * 2}px`;
        TopLeftSide.style.bottom = `${Layer}px`;
        TopLeftSide.height = `${Layer}px`;
        Projection.appendChild(TopLeftSide);
    }

    if (!Visualiser.contains(Projection)) Visualiser.appendChild(Projection);
    
    IsMoving = false;
});