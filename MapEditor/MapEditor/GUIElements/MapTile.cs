using GraphicLibary;
using MapEditor.Elements;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class MapTile : ContentControl
    {
        private static double _size = 25;
        private static Thickness _thickness = new Thickness(0);
        private static Brush _borderBrush = Brushes.Black;

        #region Static

 
        public static double GlobalSize 
        {
            get
            {
                return _size;
            }
            set
            {
                _size = value;
                if (GlobalSizeChanged != null)
                {
                    GlobalSizeChanged(new object(), new EventArgs());
                }
            }
        }

        public static event EventHandler GlobalSizeChanged;


        public static Thickness GlobalThickness
        {
            get
            {
                return _thickness;
            }
            set
            {
                _thickness = value;
                if (GlobalThicknessChanged != null)
                {
                    GlobalThicknessChanged(new object(), new EventArgs());
                }
            }
        }

        public static event EventHandler GlobalThicknessChanged;


        public static Brush GlobalBorderBrush
        {
            get
            {
                return _borderBrush;
            }
            set
            {
                _borderBrush = value;
                if (GlobalBorderBrushChanged != null)
                {
                    GlobalBorderBrushChanged(new object(), new EventArgs());
                }
            }
        }

        public static event EventHandler GlobalBorderBrushChanged;


        #region Image Dependency Properties

        // ------------------------ Imgages -----------------
        public static ImageSource GetBottomLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(BottomLayerImageProperty);
        }

        public static void SetBottomLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(BottomLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty BottomLayerImageProperty =
            DependencyProperty.RegisterAttached("BottomLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));




        public static ImageSource GetMiddleLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(MiddleLayerImageProperty);
        }

        public static void SetMiddleLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(MiddleLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty MiddleLayerImageProperty =
            DependencyProperty.RegisterAttached("MiddleLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));



        public static ImageSource GetTopLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(TopLayerImageProperty);
        }

        public static void SetTopLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(TopLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty TopLayerImageProperty =
            DependencyProperty.RegisterAttached("TopLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));


        #endregion

        #region Other Dependency Properties





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
            DependencyProperty.RegisterAttached("SelectionIndicatorVisible", typeof(Visibility), typeof(MapTile), new PropertyMetadata(Visibility.Collapsed));


        #endregion


        #endregion


        public ImageSource BottomLayerImage
        {
            get
            {
                return GetBottomLayerImage(this);
            }
            set
            {
                SetBottomLayerImage(this, value);
            }
        }

        public ImageSource MiddleLayerImage
        {
            get
            {
                return GetMiddleLayerImage(this);
            }
            set
            {
                SetMiddleLayerImage(this, value);
            }
        }

        public ImageSource TopLayerImage
        {
            get
            {
                return GetTopLayerImage(this);
            }
            set
            {
                SetTopLayerImage(this, value);
            }
        }


        public double Size
        {
            get
            {
                return GlobalSize;
            }
            set
            {
                GlobalSize = value;
            }
        }

        public bool DisplayBorder
        {
            get
            {
                return GlobalThickness.Left != 0;
            }
            set
            {
                GlobalThickness = new Thickness(value ? 1 : 0);
            }
        }

        public bool Selected
        {
            get
            {
                return (MapTile.GetSelectionIndicatorVisible(this) == System.Windows.Visibility.Visible);
            }
            set
            {
                MapTile.SetSelectionIndicatorVisible(this, (value) ? Visibility.Visible : Visibility.Collapsed);
            }
        }


        public MapTile()
        {
            //this.Width = Size;
            //this.Height = Size;

            bind("GlobalSize", MapTile.WidthProperty);
            bind("GlobalSize", MapTile.HeightProperty);
            bind("GlobalThickness", MapTile.BorderThicknessProperty);
            bind("GlobalBorderBrush", MapTile.BorderBrushProperty);
                        
            this.Background = Brushes.Orange;

            ImageSource image = new BitmapImage(GetAbsoluteUri(@"graphics\terrain\grass.png"));
            this.BottomLayerImage = image;

        }

        private void bind(string localVar, DependencyProperty dp)
        {
            Binding binding = new Binding(localVar);
            binding.Source = this;
            this.SetBinding(dp, binding);
        }


        public static Uri GetAbsoluteUri(string path)
        {
            
            return new Uri(@"D:\Visual Studio 2010\Projects\SpriteGame\MapEditor\MapEditor\bin\Debug\"+path, UriKind.Absolute);

        }

        public static MapTile Create(Tile input)
        {

        }


    }
}
