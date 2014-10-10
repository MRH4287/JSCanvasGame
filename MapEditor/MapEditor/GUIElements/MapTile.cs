using GraphicLibary;
using MapEditor.Elements;
using MapEditor.GUIElements.Base;
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
    /// <summary>
    /// The Element that is rendered to the Map
    /// </summary>
    public class MapTile : ContentControl, INotifyPropertyChanged
    {
        /// <summary>
        /// The global Size
        /// </summary>
        private static double _size = 30;
        /// <summary>
        /// The global Border Thickness 
        /// </summary>
        private static Thickness _thickness = new Thickness(0);
        /// <summary>
        /// The Global Border Brush
        /// </summary>
        private static Brush _borderBrush = Brushes.Black;


        /// <summary>
        /// Global - The Visibility of the Bottom Image
        /// </summary>
        private static Visibility _visibilityBottom = Visibility.Visible;
        /// <summary>
        /// Global - The Visibility of the Middle Image
        /// </summary>
        private static Visibility _visibilityMiddle = Visibility.Visible;
        /// <summary>
        /// Global - The Visibility of the Top Image
        /// </summary>
        private static Visibility _visibilityTop = Visibility.Visible;

        #region Static

        /// <summary>
        /// Global - The Visibility of the Bottom Image
        /// </summary>
        public static Visibility GlobalVisibilityBottom
        {
            get
            {
                return _visibilityBottom;
            }
            set
            {
                _visibilityBottom = value;
                if (GlobalVisibilityBottomChanged != null)
                {
                    GlobalVisibilityBottomChanged(new object(), new EventArgs());
                }
            }
        }

        /// <summary>
        /// Global - The Visibility Event of the Bottom Image
        /// </summary>
        public static event EventHandler GlobalVisibilityBottomChanged;

        /// <summary>
        /// Global - The Visibility of the Middle Image
        /// </summary>
        public static Visibility GlobalVisibilityMiddle
        {
            get
            {
                return _visibilityMiddle;
            }
            set
            {
                _visibilityMiddle = value;
                if (GlobalVisibilityMiddleChanged != null)
                {
                    GlobalVisibilityMiddleChanged(new object(), new EventArgs());
                }
            }
        }

        /// <summary>
        /// Global - The Visibility Event of the MiddleImage
        /// </summary>
        public static event EventHandler GlobalVisibilityMiddleChanged;

        /// <summary>
        /// Global - The Visibility of the Top Image
        /// </summary>
        public static Visibility GlobalVisibilityTop
        {
            get
            {
                return _visibilityTop;
            }
            set
            {
                _visibilityTop = value;
                if (GlobalVisibilityTopChanged != null)
                {
                    GlobalVisibilityTopChanged(new object(), new EventArgs());
                }
            }
        }

        /// <summary>
        /// Global - The Visibility Event of the Top Image
        /// </summary>
        public static event EventHandler GlobalVisibilityTopChanged;


        /// <summary>
        /// Global - The Size of all Elements
        /// </summary>
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

        /// <summary>
        /// Global - The Change Event of the GlobalSize
        /// </summary>
        public static event EventHandler GlobalSizeChanged;


        /// <summary>
        /// Global - The Thickness of all Elements
        /// </summary>
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

        /// <summary>
        /// Global - The Change Event of the GlobalThickness
        /// </summary>
        public static event EventHandler GlobalThicknessChanged;

        /// <summary>
        /// Global - The BorderBruch of all Elements
        /// </summary>
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

        /// <summary>
        /// Global - The Change Event of the GlobalBorderBrush
        /// </summary>
        public static event EventHandler GlobalBorderBrushChanged;


        #region Image Dependency Properties

        // ------------------------ Images -----------------

        /// <summary>
        /// Get the current Value of the BottomLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static ImageSource GetBottomLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(BottomLayerImageProperty);
        }

        /// <summary>
        /// Sets the current Value of the BottomLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetBottomLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(BottomLayerImageProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty BottomLayerImageProperty =
            DependencyProperty.RegisterAttached("BottomLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));



        /// <summary>
        /// Gets the current Value of the MiddleLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static ImageSource GetMiddleLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(MiddleLayerImageProperty);
        }

        /// <summary>
        /// Sets the current Value of the MiddleLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetMiddleLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(MiddleLayerImageProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty MiddleLayerImageProperty =
            DependencyProperty.RegisterAttached("MiddleLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));


        /// <summary>
        /// Gets the current Value of the TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>CurrentValue</returns>
        public static ImageSource GetTopLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(TopLayerImageProperty);
        }

        /// <summary>
        /// Sets the current Value of the TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetTopLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(TopLayerImageProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for BottomLayerImage.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty TopLayerImageProperty =
            DependencyProperty.RegisterAttached("TopLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));


        /// <summary>
        /// Gets the current Value of the Ghost-TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>CurrentValue</returns>
        public static ImageSource GetBottomGhostLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(BottomGhostLayerImageProperty);
        }

        /// <summary>
        /// Sets the current Value of the Ghost-TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetBottomGhostLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(BottomGhostLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for BottomGhostLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty BottomGhostLayerImageProperty =
            DependencyProperty.RegisterAttached("BottomGhostLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));



        /// <summary>
        /// Gets the current Value of the Ghost MiddleLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>CurrentValue</returns>
        public static ImageSource GetMiddleGhostLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(MiddleGhostLayerImageProperty);
        }

        /// <summary>
        /// Sets the current Value of the Ghost-MiddleLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetMiddleGhostLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(MiddleGhostLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for MiddleGhostLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty MiddleGhostLayerImageProperty =
            DependencyProperty.RegisterAttached("MiddleGhostLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));



        /// <summary>
        /// Gets the current Value of the Ghost TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>CurrentValue</returns>
        public static ImageSource GetTopGhostLayerImage(DependencyObject obj)
        {
            return (ImageSource)obj.GetValue(TopGhostLayerImageProperty);
        }


        /// <summary>
        /// Sets the current Value of the Ghost-TopLayer Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetTopGhostLayerImage(DependencyObject obj, ImageSource value)
        {
            obj.SetValue(TopGhostLayerImageProperty, value);
        }

        // Using a DependencyProperty as the backing store for TopGhostLayerImage.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty TopGhostLayerImageProperty =
            DependencyProperty.RegisterAttached("TopGhostLayerImage", typeof(ImageSource), typeof(MapTile), new PropertyMetadata(null));



        #endregion

        #region Other Dependency Properties

        /// <summary>
        /// Gets the current Value of the SelectionIndicatiorVisible Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static Visibility GetSelectionIndicatorVisible(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(SelectionIndicatorVisibleProperty);
        }

        /// <summary>
        /// Sets the current Value of the SelectionIndicatiorVisible Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetSelectionIndicatorVisible(DependencyObject obj, Visibility value)
        {
            obj.SetValue(SelectionIndicatorVisibleProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for SelectionIndicatorVisible.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty SelectionIndicatorVisibleProperty =
            DependencyProperty.RegisterAttached("SelectionIndicatorVisible", typeof(Visibility), typeof(MapTile), new PropertyMetadata(Visibility.Collapsed));


        /// <summary>
        /// Gets the current Value of the VisibilityBottom Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static Visibility GetVisibilityBottom(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(VisibilityBottomProperty);
        }

        /// <summary>
        /// Sets the current Value of the VisibilityBottom Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetVisibilityBottom(DependencyObject obj, Visibility value)
        {
            obj.SetValue(VisibilityBottomProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for VisibilityBottom.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty VisibilityBottomProperty =
            DependencyProperty.RegisterAttached("VisibilityBottom", typeof(Visibility), typeof(MapTile), new PropertyMetadata(_visibilityBottom));




        /// <summary>
        /// Gets the current Value of the VisibilityMiddle Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static Visibility GetVisibilityMiddle(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(VisibilityMiddleProperty);
        }

        /// <summary>
        /// Sets the current Value of the VisibilityMiddle Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetVisibilityMiddle(DependencyObject obj, Visibility value)
        {
            obj.SetValue(VisibilityMiddleProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for VisibilityMiddle.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty VisibilityMiddleProperty =
        DependencyProperty.RegisterAttached("VisibilityMiddle", typeof(Visibility), typeof(MapTile), new PropertyMetadata(_visibilityMiddle));



        /// <summary>
        /// Gets the current Value of the VisibilityTop Property
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Current Value</returns>
        public static Visibility GetVisibilityTop(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(VisibilityTopProperty);
        }

        /// <summary>
        /// Sets the current Value of the VisibilityTop Property
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">The Value to set</param>
        public static void SetVisibilityTop(DependencyObject obj, Visibility value)
        {
            obj.SetValue(VisibilityTopProperty, value);
        }

        /// <summary>
        /// Using a DependencyProperty as the backing store for VisibilityTop.  This enables animation, styling, binding, etc...
        /// </summary>
        public static readonly DependencyProperty VisibilityTopProperty =
            DependencyProperty.RegisterAttached("VisibilityTop", typeof(Visibility), typeof(MapTile), new PropertyMetadata(_visibilityTop));


        #endregion


        #endregion

        #region Display Properties

        /// <summary>
        /// The ImageSource of the BottomLayer Image
        /// </summary>
        public ImageSource BottomLayerImage
        {
            get
            {
                return GetBottomLayerImage(this);
            }
            set
            {
                SetBottomLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("BottomLayerImage"));
                }
            }
        }

        /// <summary>
        /// The Imagesource of the MiddleLayer Image
        /// </summary>
        public ImageSource MiddleLayerImage
        {
            get
            {
                return GetMiddleLayerImage(this);
            }
            set
            {
                SetMiddleLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("MiddleLayerImage"));
                }
            }
        }

        /// <summary>
        /// The ImageSource of the TopLayer Image
        /// </summary>
        public ImageSource TopLayerImage
        {
            get
            {
                return GetTopLayerImage(this);
            }
            set
            {
                SetTopLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("TopLayerImage"));
                }

            }
        }



        /// <summary>
        /// The ImageSource of the Ghost-BottomLayer Image
        /// </summary>
        public ImageSource BottomGhostLayerImage
        {
            get
            {
                return GetBottomGhostLayerImage(this);
            }
            set
            {
                SetBottomGhostLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("BottomGhostLayerImage"));
                }
            }
        }

        /// <summary>
        /// The Imagesource of the Ghost-MiddleLayer Image
        /// </summary>
        public ImageSource MiddleGhostLayerImage
        {
            get
            {
                return GetMiddleGhostLayerImage(this);
            }
            set
            {
                SetMiddleGhostLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("MiddleGhostLayerImage"));
                }
            }
        }

        /// <summary>
        /// The ImageSource of the Ghost-TopLayer Image
        /// </summary>
        public ImageSource TopGhostLayerImage
        {
            get
            {
                return GetTopGhostLayerImage(this);
            }
            set
            {
                SetTopGhostLayerImage(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("TopGhostLayerImage"));
                }

            }
        }



        /// <summary>
        /// Global - The Size of all Elements
        /// </summary>
        public double Size
        {
            get
            {
                return GlobalSize;
            }
            set
            {
                GlobalSize = value;

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("GlobalSize"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Size"));
                }

            }
        }

        /// <summary>
        /// Global - Display a Border arround the Elements
        /// </summary>
        public bool DisplayBorder
        {
            get
            {
                return GlobalThickness.Left != 0;
            }
            set
            {
                GlobalThickness = new Thickness(value ? 1 : 0);


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("DisplayBorder"));
                    PropertyChanged(this, new PropertyChangedEventArgs("GlobalThickness"));
                }


            }
        }

        /// <summary>
        /// Is this Element Selected
        /// </summary>
        public bool Selected
        {
            get
            {
                return (MapTile.GetSelectionIndicatorVisible(this) == System.Windows.Visibility.Visible);
            }
            set
            {
                MapTile.SetSelectionIndicatorVisible(this, (value) ? Visibility.Visible : Visibility.Collapsed);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("Selected"));
                }

            }
        }

        /// <summary>
        /// The corresponding Tile Object
        /// </summary>
        private Tile _tile = null;

        /// <summary>
        /// Gets and Sets the Tile Instance for this MapTile
        /// </summary>
        public Tile Tile
        {
            get
            {
                return _tile;
            }
            set
            {
                _tile = value;
                if (value != null)
                {
                    if (_tile[ElementLevel.Bottom] != null)
                    {
                        BottomLayerImage = _tile[ElementLevel.Bottom].ImageSource;
                    }
                    else
                    {
                        BottomLayerImage = null;
                    }

                    if (_tile[ElementLevel.Middle] != null)
                    {
                        MiddleLayerImage = _tile[ElementLevel.Middle].ImageSource;
                    }
                    else
                    {
                        MiddleLayerImage = null;
                    }

                    if (_tile[ElementLevel.Top] != null)
                    {
                        TopLayerImage = _tile[ElementLevel.Top].ImageSource;
                    }
                    else
                    {
                        TopLayerImage = null;
                    }

                }

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("Tile"));
                    PropertyChanged(this, new PropertyChangedEventArgs("BottomElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("MiddleElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("TopElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }

            }

        }

        /// <summary>
        /// The ElementDefinition for the BottomLayer
        /// </summary>
        public ElementDefinition BottomElement
        {
            get
            {
                if (Tile != null)
                {
                    return Tile[ElementLevel.Bottom];
                }
                else
                {
                    return null;
                }
            }

            set
            {
                if (Tile != null)
                {
                    this.Tile[ElementLevel.Bottom] = value;
                }

                if (value != null)
                {
                    this.BottomLayerImage = value.ImageSource;
                }
                else
                {
                    this.BottomLayerImage = null;
                }

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("BottomElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }

            }

        }

        private TileElement bottomTile;

        /// <summary>
        /// The used Tile for the Bottom
        /// </summary>
        public TileElement BottomTile
        {
            get
            { 
                return bottomTile; 
            }
            set 
            {
                var old = bottomTile;

                bottomTile = value;

                if (old != null)
                {
                    old.postDelete(this);
                }
            }
        }


        /// <summary>
        /// The ElementDefinition for the MiddleLayer
        /// </summary>
        public ElementDefinition MiddleElement
        {
            get
            {
                if (Tile != null)
                {
                    return Tile[ElementLevel.Middle];
                }
                else
                {
                    return null;
                }
            }

            set
            {
                if (Tile != null)
                {
                    this.Tile[ElementLevel.Middle] = value;
                }

                if (value != null)
                {
                    this.MiddleLayerImage = value.ImageSource;
                }
                else
                {
                    this.MiddleLayerImage = null;
                }


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("MiddleElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }
            }

        }


        private TileElement middleTile;

        /// <summary>
        /// The used Tile for the Middle
        /// </summary>
        public TileElement MiddleTile
        {
            get
            {
                return middleTile;
            }
            set
            {
                var old = middleTile;

                middleTile = value;

                if (old != null)
                {
                    old.postDelete(this);
                }
            }
        }

        /// <summary>
        /// The ElementDefinition for the TopLayer
        /// </summary>
        public ElementDefinition TopElement
        {
            get
            {
                if (Tile != null)
                {
                    return Tile[ElementLevel.Top];
                }
                else
                {
                    return null;
                }
            }

            set
            {
                if (Tile != null)
                {
                    this.Tile[ElementLevel.Top] = value;
                }

                if (value != null)
                {
                    this.TopLayerImage = value.ImageSource;
                }
                else
                {
                    this.TopLayerImage = null;
                }


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("TopElement"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }
            }

        }


        private TileElement topTile;

        /// <summary>
        /// The used Tile for the Middle
        /// </summary>
        public TileElement TopTile
        {
            get
            {
                return topTile;
            }
            set
            {
                var old = topTile;

                topTile = value;

                if (old != null)
                {
                    old.postDelete(this);
                }
            }
        }


        /// <summary>
        /// The Visibility of the BottomElement
        /// </summary>
        public Visibility VisibilityBottom
        {
            get
            {
                return MapTile.GetVisibilityBottom(this);
            }
            set
            {
                MapTile.SetVisibilityBottom(this, value);


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("VisibilityBottom"));
                }

            }
        }

        /// <summary>
        /// The Visibility of the MiddleElement
        /// </summary>
        public Visibility VisibilityMiddle
        {
            get
            {
                return MapTile.GetVisibilityMiddle(this);
            }
            set
            {
                MapTile.SetVisibilityMiddle(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("VisibilityMiddle"));
                }
            }
        }

        /// <summary>
        /// The Visibility of the TopElement
        /// </summary>
        public Visibility VisibilityTop
        {
            get
            {
                return MapTile.GetVisibilityTop(this);
            }
            set
            {
                MapTile.SetVisibilityTop(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("VisibilityTop"));
                }
            }
        }


        /// <summary>
        /// Global - Show the BottomLayer Image
        /// </summary>
        public bool ShowBottom
        {
            get
            {
                return GlobalVisibilityBottom == System.Windows.Visibility.Visible;
            }
            set
            {
                GlobalVisibilityBottom = (value) ? Visibility.Visible : Visibility.Collapsed;

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("ShowBottom"));
                    PropertyChanged(this, new PropertyChangedEventArgs("GlobalVisibilityBottom"));
                }
            }
        }

        /// <summary>
        /// Global - Show the MiddleLayer Image
        /// </summary>
        public bool ShowMiddle
        {
            get
            {
                return GlobalVisibilityMiddle == System.Windows.Visibility.Visible;
            }
            set
            {
                GlobalVisibilityMiddle = (value) ? Visibility.Visible : Visibility.Collapsed;


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("ShowMiddle"));
                    PropertyChanged(this, new PropertyChangedEventArgs("GlobalVisibilityMiddle"));
                }
            }
        }

        /// <summary>
        /// Global - Show the TopLayer Image
        /// </summary>
        public bool ShowTop
        {
            get
            {
                return GlobalVisibilityTop == System.Windows.Visibility.Visible;
            }
            set
            {
                GlobalVisibilityTop = (value) ? Visibility.Visible : Visibility.Collapsed;


                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("ShowTop"));
                    PropertyChanged(this, new PropertyChangedEventArgs("GlobalVisibilityTop"));
                }
            }
        }
        

        #endregion

        #region Data Properties

        /// <summary>
        /// Local X-Position
        /// </summary>
        private int _x = 0;

        /// <summary>
        /// Local Y-Position
        /// </summary>
        private int _y = 0;

        /// <summary>
        /// The X-Position on the Map
        /// </summary>
        public int X 
        { 
            get
            {
                return _x;
            }
            set
            {
                _x = value;

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("X"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }
            }

        }

        /// <summary>
        /// The Y-Position on the Map
        /// </summary>
        public int Y
        {
            get
            {
                return _y;
            }
            set
            {
                _y = value;

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("Y"));
                    PropertyChanged(this, new PropertyChangedEventArgs("Tooltip"));
                }
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

                if (Tile != null)
                {
                    if (!string.IsNullOrWhiteSpace(Tile.ID))
                    {
                        builder.AppendFormat("[ID] = '{0}' - ", Tile.ID);
                    }

                    if (BottomElement != null)
                    {
                        builder.AppendFormat("[Bottom] = '{0}' - ", BottomElement.ID);
                    }

                    if (MiddleElement != null)
                    {
                        builder.AppendFormat("[Middle] = '{0}' - ", MiddleElement.ID);
                    }

                    if (TopElement != null)
                    {
                        builder.AppendFormat("[Top] = '{0}' - ", TopElement.ID);
                    }
                }

                builder.AppendFormat("[Position] = {0},{1}", X, Y);

                return builder.ToString();
            }
        }

        #endregion

        /// <summary>
        /// Constructor of the MapTile Class
        /// </summary>
        public MapTile()
            : this(true)
        {

        }

        /// <summary>
        /// Constructor of the MapTile Class
        /// </summary>
        public MapTile(bool bindToGlobal)
        {
            if (bindToGlobal)
            {
                //this.Width = Size;
                //this.Height = Size;
                MapController.Bind(this, "GlobalSize", MapTile.WidthProperty);
                MapController.Bind(this, "GlobalSize", MapTile.HeightProperty);
                MapController.Bind(this, "GlobalThickness", MapTile.BorderThicknessProperty);
                MapController.Bind(this, "GlobalBorderBrush", MapTile.BorderBrushProperty);

                MapController.Bind(this, "GlobalVisibilityBottom", MapTile.VisibilityBottomProperty);
                MapController.Bind(this, "GlobalVisibilityMiddle", MapTile.VisibilityMiddleProperty);
                MapController.Bind(this, "GlobalVisibilityTop", MapTile.VisibilityTopProperty);
            }
            MapController.Bind(this, "Tooltip", MapTile.ToolTipProperty);

            this.Background = Brushes.Orange;

            ImageSource image = new BitmapImage(MapController.GetAbsoluteUri(@"graphics\terrain\grass.png"));
            this.BottomLayerImage = image;

        }

        


        /// <summary>
        /// Create a new MapTile Instance from a Tile Instance
        /// </summary>
        /// <param name="input">Tile Instance</param>
        /// <returns>MapTile Instance</returns>
        public static MapTile Create(Tile input)
        {
            MapTile output = new MapTile();
            output.Tile = input;

            return output;
        }

        /// <summary>
        /// Clears the Ghost Images of this Tile
        /// </summary>
        public void ClearGhostImage()
        {
            this.TopGhostLayerImage = null;
            this.MiddleGhostLayerImage = null;
            this.BottomGhostLayerImage = null;
        }


        /// <summary>
        /// Notify of Property Changed
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;
    }
}
