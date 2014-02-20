using MapEditor.GUIElements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MapEditor
{
    /// <summary>
    /// Interaktionslogik für MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        MapController controller;

        public MainWindow()
        {
            InitializeComponent();

            controller = new MapController(this.MapHolder, this.TileHolder);
        }

        private void Grid_Loaded(object sender, RoutedEventArgs e)
        {
            //this.TestTile.DataContext = new MapTile();
            var tile = new MapTile();

            this.CheckDisplayBorder.DataContext = tile;
            this.CheckShowBottom.DataContext = tile;
            this.CheckShowMiddle.DataContext = tile;
            this.CheckShowTop.DataContext = tile;
            this.SlideSize.DataContext = tile;

            this.MapRowTemplate.Visibility = System.Windows.Visibility.Collapsed;

            #region ColorDropdown

            this.DropColor.DataContext = tile;

            System.Collections.ObjectModel.ObservableCollection<ColorDataModel> colors = new System.Collections.ObjectModel.ObservableCollection<ColorDataModel>();
            colors.Add(new ColorDataModel()
            {
                Color = Brushes.Black,
                Name = "Black"
            });
            colors.Add(new ColorDataModel()
            {
                Color = Brushes.Red,
                Name = "Red"
            });
            colors.Add(new ColorDataModel()
            {
                Color = Brushes.Green,
                Name = "Green"
            });
            colors.Add(new ColorDataModel()
            {
                Color = Brushes.Yellow,
                Name = "Yellow"
            });
            colors.Add(new ColorDataModel()
            {
                Color = Brushes.White,
                Name = "White"
            });

            this.DropColor.ItemsSource = colors;
            this.DropColor.SelectionChanged += (s, ev) =>
                {
                    MapTile.GlobalBorderBrush = ((ColorDataModel)this.DropColor.SelectedItem).Color;
                };


            #endregion

        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {

            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            controller.addRow(30);
            
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            controller.LoadConfig("./map/", "./prefabs/");
            controller.LoadMap("./map/map2.json");

        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            this.MapHolder.Children.Clear();
        }

        private void Button_Click_3(object sender, RoutedEventArgs e)
        {
            controller.Serialize();

        }
    }
}
