using MapEditor.Elements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TileImage : SelectableImage 
    {
        public ElementDefinition Element { get; set; }

        public TileImage()
            : base()
        {
            this.Width = MapTile.GlobalSize;
            this.Height = MapTile.GlobalSize;
        }

        public TileImage(ElementDefinition def)
            : this()
        {
            this.Element = def;
            this.ImageSource = new BitmapImage(def.ImagePath);



        }


    }
}
