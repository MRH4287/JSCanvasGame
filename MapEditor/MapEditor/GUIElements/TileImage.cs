using MapEditor.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TileImage : Image
    {
        public ElementDefinition Element { get; set; }

        public TileImage(ElementDefinition def)
            : base()
        {
            this.Element = def;
            this.Source = new BitmapImage(def.ImagePath);

            this.Width = MapTile.GlobalSize;
            this.Height = MapTile.GlobalSize;

        }


    }
}
