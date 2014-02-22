﻿using MapEditor.GUIElements;
using System;
using System.Collections.Generic;
using System.IO;
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


        private void LoadConfigMenu(object sender, RoutedEventArgs e)
        {
            var open = new System.Windows.Forms.FolderBrowserDialog();

            if (open.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                controller.LoadConfig(open.SelectedPath + "/map/", open.SelectedPath + "/prefabs/");

            }
        }

        private void LoadDefaultConfigMenu(object sender, RoutedEventArgs e)
        {
            controller.LoadConfig("./map/", "./prefabs/");
        }

        private void OpenMap(object sender, RoutedEventArgs e)
        {
            if (controller.Elements == null)
            {
                var res = MessageBox.Show("No config loaded. Load default Config?", "Load default Config?", MessageBoxButton.YesNo);
                if (res == MessageBoxResult.Yes)
                {
                    LoadDefaultConfigMenu(sender, e);
                }
            }

            var open = new System.Windows.Forms.OpenFileDialog();
            open.Filter = "Json-File|*.json";

            if (open.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                controller.LoadMap(open.FileName);

            }

        }

        private void SaveMap(object sender, RoutedEventArgs e)
        {
            var dialoge = new System.Windows.Forms.SaveFileDialog();
            dialoge.Filter = "Json-File|*.json";
            if (dialoge.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                var text = controller.Serialize();

                using (StreamWriter stream = File.CreateText(dialoge.FileName))
                {
                    stream.Write(text);
                }

            }


        }

        private void NewMap(object sender, RoutedEventArgs e)
        {
            if (controller.Elements == null)
            {
                var res = MessageBox.Show("No config loaded. Load default Config?", "Load default Config?", MessageBoxButton.YesNo);
                if (res == MessageBoxResult.Yes)
                {
                    LoadDefaultConfigMenu(sender, e);
                }
            }

            controller.createMap(30, 10);
        }

    }
}
