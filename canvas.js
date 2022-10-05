const WoLLabel = document.getElementsByClassName('wol_screen')[0];
const overlay = document.getElementsByClassName('overlay')[0];
const BombLabel = document.querySelector('.bomb-label')
const resetButton = document.querySelector('.reset-btn')
const resetButton2 = document.querySelector('.reset-btn2')

const tile0img = document.getElementById('tile0');
const bombTile = document.getElementById('tile1');
const tileRevealed = document.querySelector('#tileR')
const flag = document.querySelector('#flag')

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const rectHeight = 10;
const rectWidth = canvas.getAttribute('width') / rectHeight;
const maxTiles = rectHeight ** 2;
const qnt_bombs = 10;

const map = {
  hor: rectHeight,
  vert: rectHeight,
  tsize: rectWidth,
  tiles: new Array(100).fill(0),
  getTile: function(hor, vert) {
    return this.tiles[(vert * this.hor) + hor];
  },
  getCoord: function(index) {
    const x = index % this.hor;
    const y = Math.floor(index / this.vert);
    return [x, y];
  },
  getIndex: function(x, y) {
    return Number(`${y - 1}${x - 1}`);
  },
};

class TileMap {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.BombsAmount = 0
    this.WinFlagCount = 0
    this.FlagCount = 0
    this.currpos = {
      x: 0,
      y: 0
    };

    this.fillBackground();
    this.drawTiles();
    this.drawBombs();
    this.drawNumbers();
    this.clickProof();
    BombLabel.innerHTML = `Bombas restantes: ${ this.BombsAmount }`
  }

  fillBackground(color='#8c8c8c') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
  }

  drawTiles() {
    for (let j = 0; j < canvas.getAttribute('height'); j++) {
      for (let i = 0; i < canvas.getAttribute('width'); i++) {
	this.tile(0, i, j)
      }
    }
  }
  
  tile(img, x , y) {
    try {
    ctx.drawImage(document.querySelector(`#tile-${img}`), map.tsize * x, map.tsize * y, rectWidth, rectWidth);
    } catch ( e ) {
      console.error(e)
    }
  }
  
  // Auto-draw tiles FIX!
  genEmptyTiles(x, y) {
    this.tile(2,x,y)

    this.loopCoordX(1,x,y)
    this.loopCoordX(-1,x,y)
    this.loopCoordY(1,x,y)
    this.loopCoordY(-1,x,y)
  }
  loopCoordX(i, x, y) {
    let bucle = true;
    while (bucle) {
      x = x + i
      let tileType = map.getTile(x , y)
      if (tileType === 0) {
	this.tile(2, x , y)
	this.loopCoordY(i,x,y)
	this.loopCoordY(-i,x,y)
      }
      else {
	this.tile(tileType, x , y)
	bucle = false
      }
    }
  }
  loopCoordX2(i,x,y){
    let bucle = true;
    while (bucle) {
      x = x + i
      let tileType = map.getTile(x , y)
      if (tileType === 0) {
	this.tile(2, x , y)
	this.loopCoordY2(1,x,y)
	this.loopCoordY2(-1,x,y)
      }
      else {
	this.tile(tileType, x , y)
	bucle = false
      }
    }
  }
  loopCoordY(i, x, y) {
    let bucle = true;
    while (bucle) {
      y = y + i
      let tileType = map.getTile(x , y)
      if (tileType === 0) {
	this.tile(2, x , y)
	this.loopCoordX2(1,x,y)
	this.loopCoordX2(-1,x,y)
      }
      else {
	this.tile(tileType, x , y)
	bucle = false
      }
    }
  }
  loopCoordY2(i, x, y) {
    let bucle = true;
    while (bucle) {
      y = y + i
      let tileType = map.getTile(x , y)
      if (tileType === 0) {
	this.tile(2, x , y)
      }
      else {
	this.tile(tileType, x , y)
	bucle = false
      }
    }
  }
  //////////////////////////////////////

  clickProof() {
    // Left click
    canvas.onmousedown = (event) => {
      event.preventDefault()
      let rect = canvas.getBoundingClientRect();
      this.currpos.x = Math.floor((event.clientX - rect.left) / rectWidth) + 1;
      this.currpos.y = Math.floor((event.clientY - rect.top) / rectWidth) + 1;

      const {x, y} = this.currpos;
      
      if ( event.button == 0 ) {
	console.log(
	  x, y, 
	  map.getTile( x - 1, y - 1 )
	)

	const tileType = map.getTile( x - 1, y - 1 )
	// Number tile
	if (tileType > 10) {
	  this.number(x - 1, y - 1, tileType);
	}
	// Empty tile
	if (tileType == 0) { 
	  this.genEmptyTiles(x - 1, y - 1);
	  // this.tile(2, x - 1, y - 1)
	}
	
	// Bomb tile - Lose State  
	if (tileType == 1) {
	  WoLLabel.classList.toggle('hidden');
	  WoLLabel.innerHTML = `PERDISTE`;
	  WoLLabel.style.color = 'red';
	  overlay.classList.toggle('hidden');
	  overlay.style.backgroundColor = 'rgb(255, 233, 232, 0.1)';
	  resetButton.focus()
	  this.bomb(x - 1, y - 1)
	}
      }
    }
    
    // Right click
    canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      let rect = canvas.getBoundingClientRect();
      this.currpos.x = Math.floor((event.clientX - rect.left) / rectWidth) + 1;
      this.currpos.y = Math.floor((event.clientY - rect.top) / rectWidth) + 1;

      const {x, y} = this.currpos;
      
      const tileType = map.getTile( x - 1, y - 1 )

      this.drawFlag( x - 1, y - 1)
      this.FlagCount++
      map.tiles[map.getIndex(x, y)] = [tileType, 3]

      if ( tileType == 1 ) {
	this.WinFlagCount++;

	// Win State
	if ( this.FlagCount == this.BombsAmount && this.WinFlagCount == this.BombsAmount ) {
	  WoLLabel.classList.toggle('hidden');
	  WoLLabel.innerHTML = `GANASTE`;
	  WoLLabel.style.color = 'green';
	  overlay.classList.toggle('hidden');
	  overlay.style.backgroundColor = 'rgb(30, 255, 0, 0.1)';
	  resetButton.focus()
	}
      }

      if (this.verify(tileType[1])) {
	this.tile(0, x - 1, y - 1)
	this.FlagCount -= 2;
	if ( tileType[0] == 1 ) {
	    this.WinFlagCount--;
	}
	map.tiles[map.getIndex(x, y)] = tileType[0]
      }
      
      BombLabel.innerHTML = `Bombas restantes: ${ this.BombsAmount - this.FlagCount }`
      console.log(map.tiles)
    }, false)
  }
  
  verify(tileType) {
     if ( tileType == 3 ) {
	return true
     }
  }

  drawFlag(x, y){
    this.tile(3, x, y)
  }

  rand(min=15, max=20) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  drawBombs() {
    let x = []
      , y = [];
    for (let i = 0; i < qnt_bombs; i++) {
      const randX = this.rand(1,9);
      const randY = this.rand(1,9);

      if (x.includes(randX) && y.includes(randY)) {
	i--;
	continue;
      }

      map.tiles[map.getIndex(randX + 1, randY + 1)] = 1;

      // this.bomb(randX, randY);
      
      x.push(randX);
      y.push(randY);
    }
    
    map.tiles.forEach((el) => {
      if (el === 1) this.BombsAmount++
    })
  }

  bomb(x, y) {
    this.tile(1, x, y)
  }

  drawNumbers() {
    let bombCount;
    map.tiles.forEach((tile,i)=>{
      bombCount = 10;
      if (tile === 0) {
	const [x,y] = map.getCoord(i);

	if (map.getTile(x + 1, y + 1) === 1) {
	  bombCount++;
	}
	if (map.getTile(x + 1, y) === 1) {
	  bombCount++;
	}
	if (map.getTile(x + 1, y - 1) === 1) {
	  bombCount++;
	}
	if (map.getTile(x, y + 1) === 1) {
	  bombCount++;
	}
	if (map.getTile(x, y - 1) === 1) {
	  bombCount++;
	}
	if (map.getTile(x - 1, y + 1) === 1) {
	  bombCount++;
	}
	if (map.getTile(x - 1, y) === 1) {
	  bombCount++;
	}
	if (map.getTile(x - 1, y - 1) === 1) {
	  bombCount++;
	}

	if (bombCount === 10)
	  return;

	map.tiles[map.getIndex(x + 1, y + 1 )] = bombCount;

	// this.number(x, y);
      }
    }
    );
  }

  number(x, y) {
    const tileType = map.getTile( x , y )
    this.tile(tileType, x, y)
  }
}

function draw() {
  new TileMap();
  resetButton2.focus()
}

resetButton.addEventListener('click', (e)=> {
  e.preventDefault()
  location.reload() 
})
resetButton2.addEventListener('click', (e)=> {
  e.preventDefault()
  location.reload() 
})


window.onload = draw;
