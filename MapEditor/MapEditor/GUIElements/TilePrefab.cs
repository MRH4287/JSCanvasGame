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
        private Prefab element = null;

        public Prefab Element
        {
            get
            {
                return element;
            }
            set
            {
                element = value;
                triggerPropertyChanged("Element");
                triggerPropertyChanged("Tooltip");
            }
        }


        /// <summary>
        /// The Tooltip of the Element
        /// </summary>
        public string Tooltip
        {
            get
            {
                StringBuilder builder = new StringBuilder();

                builder.Append("Prefab - ");
                if (Element != null)
                {

                    builder.AppendFormat("[ID] = {0}", Element.ID);
                }

                return builder.ToString();
            }
        }

        public TilePrefab(Prefab def)
            : base()
        {
            this.Width = MapTile.GlobalSize;
            this.Height = MapTile.GlobalSize;

            this.Element = def;
            this.ImageSource = new BitmapImage(def.PreviewImageUri);

            MapController.Bind(this, "Tooltip", MapTile.ToolTipProperty);
        }


    }
}
