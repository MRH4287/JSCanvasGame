using MapEditor.Elements;
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
    class TileImage : ContentControl
    {
        #region Dependencie Properties

        public static ImageSource GetImageSource(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(ImageSourceProperty);
        }

        public static void SetImageSource(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(ImageSourceProperty, value);
        }

        // Using a DependencyProperty as the backing store for ImageSource.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty ImageSourceProperty =
            DependencyProperty.RegisterAttached("ImageSource", typeof(ImageSource), typeof(TileImage), new PropertyMetadata(null));


        public ImageSource ImageSource
        {
            get
            {
                return GetImageSource(this);
            }
            set
            {
                SetImageSource(this, value);
            }
        }


        public static Visibility GetSelectionIndicatorVisible(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(SelectionIndicatorVisibleProperty);
        }

        public static void SetSelectionIndicatorVisible(DependencyObject obj, Visibility value)
        {
            obj.SetValue(SelectionIndicatorVisibleProperty, value);
        }

        // Using a DependencyProperty as the backing store for SelectionIndicatorVisible.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty SelectionIndicatorVisibleProperty =
            DependencyProperty.RegisterAttached("SelectionIndicatorVisible", typeof(Visibility), typeof(TileImage), new PropertyMetadata(Visibility.Collapsed));


        public bool Selected
        {
            get
            {
                return (GetSelectionIndicatorVisible(this) == System.Windows.Visibility.Visible);
            }
            set
            {
                SetSelectionIndicatorVisible(this, (value) ? Visibility.Visible : Visibility.Collapsed);
            }
        }




        #endregion


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
