using MapEditor.Elements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TilePrefab : SelectableImage
    {
        public Prefab Element;


        public TilePrefab(Prefab def)
            : base()
        {
            this.Width = MapTile.GlobalSize;

            // NaN ==> Auto
            this.Height = Double.NaN;

            this.Element = def;
            this.ImageSource = new BitmapImage(def.PreviewImageUri);

        }


    }
}
