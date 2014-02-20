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
        private ElementDefinition _element = null;

        public ElementDefinition Element 
        {
            get
            {
                return _element;
            }

            set
            {
                _element = value;

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

                if (Element != null)
                {
                    builder.AppendFormat("[ID] = {0} - ", Element.ID);
                    builder.AppendFormat("[Name] = {0}", Element.Name);

                }

                return builder.ToString();
            }
        }

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


            MapController.Bind(this, "Tooltip", MapTile.ToolTipProperty);
        }


    }
}
