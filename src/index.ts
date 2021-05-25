import $ from "jQuery";

interface SocialHallData {
  radius: number;
  childCount: number;
}

interface Coords {
  xCoords: number;
  yCoords: number;
  radius: number;
}

interface SocialHallOptions {
  width: number;
  height: number;
  gutterSpace?: number; // space between the circle.
  circlePackingGutterSpace?: number; // space between the circle packed item
  data: Array<SocialHallData>;
}

class SocialHallViz {
  private width: number;
  private height: number;
  private gutterSpace: number; // minimum distance between 2 circle;
  private data: Array<SocialHallData>;
  private particles: Array<Coords> = [];
  private circlePackingGutterSpace: number;
  private blockedXCoords: Array<number> = [];
  private blockedYCoords: Array<number> = [];

  constructor({
    width,
    height,
    data,
    gutterSpace,
    circlePackingGutterSpace
  }: SocialHallOptions) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.gutterSpace = gutterSpace || 10;
    this.circlePackingGutterSpace = circlePackingGutterSpace || 10;
  }

  // protected randomIntFromRange(min: number, max: number) {
  //   return Math.floor(Math.random() * (max - min + 1) + min);
  // }

  protected randomIntFromRange(radius: number) {
    return {
      xCoords: Math.floor(
        Math.random() * (this.width - radius * 2 + 1) + radius
      ),
      yCoords: Math.floor(
        Math.random() * (this.height - radius * 2 + 1) + radius
      )
    };
  }

  protected distance(x1: number, y1: number, x2: number, y2: number) {
    var xDist = x2 - x1;
    var yDist = y2 - y1;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
  }

  protected isCollision(circle1: Coords, circl2: Coords): boolean {
    const distance = this.distance(
      circle1.xCoords,
      circle1.yCoords,
      circl2.xCoords,
      circl2.yCoords
    );
    const radiiSum = circle1.radius * 2 + circl2.radius * 2;
    return distance - radiiSum < this.gutterSpace;
  }

  /**
   * Method calculates outer circle radius basis on provided childCount
   */
  private getUpdatedRadius(): Array<SocialHallData> {
    return this.data.map((item) => {
      return {
        ...item,
        radius: item.radius * item.childCount
      };
    });
  }

  public generateCoords(): Array<Coords> {
    const radiusCalculator = this.getUpdatedRadius();

    radiusCalculator.forEach(({ radius }, index) => {
      let { xCoords, yCoords } = this.randomIntFromRange(radius);

      if (!!index) {
        for (let i = 0; i < this.particles.length; i++) {
          const isCollision = this.isCollision(
            { xCoords, yCoords, radius },
            this.particles[i]
          );
          if (isCollision) {
            const coords = this.randomIntFromRange(radius);
            xCoords = coords.xCoords;
            yCoords = coords.yCoords;
            i = -1;
          }
        }
      }

      this.particles.push({ xCoords, yCoords, radius });
    });

    return this.particles;
  }
}

const width = 312;
const height = 312;

const socialHallViz = new SocialHallViz({
  width: width,
  height: height,
  data: [
    { radius: 25, childCount: 1 },
    { radius: 25, childCount: 2 },
    { radius: 25, childCount: 1 },
    { radius: 25, childCount: 1 }
    // { radius: 25, childCount: 1 },
    // { radius: 25, childCount: 4 },
    // { radius: 25, childCount: 2 },
    // { radius: 25, childCount: 6 },
    // { radius: 25, childCount: 4 },
    // { radius: 25, childCount: 1 }
  ]
});

const inPixel = socialHallViz.generateCoords();
console.log(JSON.stringify(inPixel));
$(document).ready(() => {
  const col = Math.floor(width / 50);
  const row = Math.floor(height / 50);
  for (let i = 0; i <= col; i++) {
    $("#grid-col").append(`<div style="
      min-height: ${height}px;
      left: ${50 * i}px;
    ">${50 * i}</div>`);
  }
  for (let i = 0; i <= row; i++) {
    $("#grid-row").append(`<div style="
      min-width: ${width}px;
      top: ${50 * i}px;
    ">${50 * i}</div>`);
  }
  inPixel.forEach((coords) => {
    const { xCoords, yCoords, radius } = coords;
    $("#grid").append(
      `<div
        style="
          top: ${yCoords}px;
          left: ${xCoords}px;
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          border-radius: ${radius}px;
        ">
          <span>y:${yCoords}</span>
          <span>x:${xCoords}</span>
      </div>`
    );
  });
});
