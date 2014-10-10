using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;

namespace MapEditor.GUIElements.Base
{
    public abstract class TileElement<T> : TileElement
    {
        public static T GetElement(DependencyObject obj)
        {
            return (T)obj.GetValue(ElementProperty);
        }

        public static void SetElement(DependencyObject obj, T value)
        {
            obj.SetValue(ElementProperty, value);

            var self = obj as TileElement<T>;
            if (self != null)
            {

                self.triggerPropertyChanged("Element");
                self.triggerPropertyChanged("Tooltip");
            }
        }

        // Using a DependencyProperty as the backing store for Element.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty ElementProperty =
            DependencyProperty.RegisterAttached("Element", typeof(T), typeof(TileElement<T>), new PropertyMetadata(null));


        public T Element
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

        public TileElement()
            : base()
        {
            this.Width = MapTile.GlobalSize;
            this.Height = MapTile.GlobalSize;
        }

        public TileElement(T def)
            : this()
        {
            this.Element = def;
            MapController.Bind(this, "Tooltip", TileImage.ToolTipProperty);

            this.triggerPropertyChanged("TileImageSource");
        }
    }

    public abstract class TileElement : SelectableImage
    {

        /// <summary>
        /// The Tooltip of the Element
        /// </summary>
        public abstract string Tooltip
        {
            get;
        }

        /// <summary>
        /// Triggered before an Element with this Definition is painted
        /// </summary>
        /// <param name="destination">The paint Destination</param>
        /// <returns>Allow painting</returns>
        public virtual bool prePaint(MapTile destination)
        {
            return true;
        }


        /// <summary>
        /// Triggered after an Element with this Definition is painted
        /// </summary>
        /// <param name="destination">The paint Destination</param>
        /// <returns>Allow painting</returns>
        public virtual void postPaint(MapTile destination)
        {

        }


        /// <summary>
        /// Trigger after an Element with this Definition was removed
        /// </summary>
        /// <param name="destination">The Tile where the Element was</param>
        public virtual void postDelete(MapTile destination)
        {

        }
    }

}
