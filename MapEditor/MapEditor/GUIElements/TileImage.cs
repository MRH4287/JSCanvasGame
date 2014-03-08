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
        public static ElementDefinition GetElement(DependencyObject obj)
        {
            return (ElementDefinition)obj.GetValue(ElementProperty);
        }

        public static void SetElement(DependencyObject obj, ElementDefinition value)
        {
            obj.SetValue(ElementProperty, value);

            var self = obj as TileImage;
            if (self != null)
            {

                self.triggerPropertyChanged("Element");
                self.triggerPropertyChanged("TileImageSource");
                self.triggerPropertyChanged("Tooltip");
            }
        }

        // Using a DependencyProperty as the backing store for Element.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty ElementProperty =
            DependencyProperty.RegisterAttached("Element", typeof(ElementDefinition), typeof(TileImage), new PropertyMetadata(null));



        public ImageSource TileImageSource
        {
            get
            {
                if (this.Element == null)
                {
                    return null;
                }

                return this.Element.ImageSource;
            }
        }

        public ElementDefinition Element
        {
            get
            {
                return GetElement(this);
            }

            set
            {
                SetElement(this, value);
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

            MapController.Bind(this, "Tooltip", TileImage.ToolTipProperty);
            MapController.Bind(this, "TileImageSource", TileImage.ImageSourceProperty);

            this.triggerPropertyChanged("TileImageSource");
        }



    }
}
