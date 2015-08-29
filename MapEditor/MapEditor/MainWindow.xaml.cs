using MapEditor.Elements;
using MapEditor.GUIElements;
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

        private ElementDefinitionSelect elementDefSelectWindow = null;
        //private AnimationEdit animationEdit = null;

        public MainWindow()
        {
            InitializeComponent();

            controller = new MapController(this.MapHolder, this.TileHolder, this.CommandTileHolder, this.PrefabTileHolder, this.ScriptedTileHolder);
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

        private void LoadConfigMenu(object sender, RoutedEventArgs e)
        {
            var open = new System.Windows.Forms.FolderBrowserDialog();

            if (open.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                controller.LoadConfig(open.SelectedPath + "/data/", open.SelectedPath + "/prefabs/");

            }
        }

        private void LoadDefaultConfigMenu(object sender, RoutedEventArgs e)
        {
            controller.LoadConfig("./data/", "./prefabs/");
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

            if (controller.Elements != null)
            {
                var open = new System.Windows.Forms.OpenFileDialog();
                open.Filter = "Json-File|*.json";

                if (open.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                {
                    controller.LoadMap(open.FileName);

                }
            }

        }

        private void ClearButton_Click(object sender, RoutedEventArgs e)
        {
            this.SearchBox.Clear();
        }

        private void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            var container = this.TileContainer;

            int countChildElements = VisualTreeHelper.GetChildrenCount(container);
            for (int i = 0; i < countChildElements; i++)
            {
                var element = VisualTreeHelper.GetChild(container, i) as FrameworkElement;
                if ((element != null) && (element is WrapPanel))
                {
                    filterWrapPanel(element as WrapPanel, this.SearchBox.Text);
                }

            }

        }

        private void filterWrapPanel(WrapPanel element, string text)
        {
            int elementCount = VisualTreeHelper.GetChildrenCount(element);

            for (int i = 0; i < elementCount; i++)
            {
                var child = VisualTreeHelper.GetChild(element, i) as FrameworkElement;

                if (child == null)
                {
                    continue;
                }

                if (child is TileImage)
                {
                    if (String.IsNullOrWhiteSpace(text))
                    {
                        child.Visibility = System.Windows.Visibility.Visible;
                    }
                    else
                    {
                        if (((TileImage)child).Element.Name.ToLower().Contains(text.ToLower()))
                        {
                            child.Visibility = System.Windows.Visibility.Visible;
                        }
                        else
                        {
                            child.Visibility = System.Windows.Visibility.Collapsed;
                        }
                    }
                }
                else if (child is TilePrefab)
                {
                    if (String.IsNullOrWhiteSpace(text))
                    {
                        child.Visibility = System.Windows.Visibility.Visible;
                    }
                    else
                    {
                        if (((TilePrefab)child).Element.ID.ToLower().Contains(text.ToLower()))
                        {
                            child.Visibility = System.Windows.Visibility.Visible;
                        }
                        else
                        {
                            child.Visibility = System.Windows.Visibility.Collapsed;
                        }
                    }
                }

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

        private async void NewMap(object sender, RoutedEventArgs e)
        {
            if (controller.Elements == null)
            {
                var res = MessageBox.Show("No config loaded. Load default Config?", "Load default Config?", MessageBoxButton.YesNo);
                if (res == MessageBoxResult.Yes)
                {
                    LoadDefaultConfigMenu(sender, e);
                }
            }
            if (controller.Elements != null)
            {
                try
                {
                    var size = await MapEditor.TextInput.Display("Insert Map Size. Comma Seperated for X and Y", "30,30");

                    var sizeSplit = size.Split(',');


                    controller.createMap(int.Parse(sizeSplit[0]), int.Parse(sizeSplit[1]));
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error in Map Creation: " + ex.Message);
                }
            }
        }


        private async void ChangeSize(object sender, RoutedEventArgs e)
        {
            if (controller.Elements == null)
            {
                var res = MessageBox.Show("No config loaded. Load default Config?", "Load default Config?", MessageBoxButton.YesNo);
                if (res == MessageBoxResult.Yes)
                {
                    LoadDefaultConfigMenu(sender, e);
                }
            }
            if (controller.Elements != null)
            {
                try
                {
                    var height = MapHolder.Children.Count;
                    if (height == 0)
                    {
                        NewMap(sender, e);
                        return;
                    }

                    var width = ((StackPanel)MapHolder.Children[0]).Children.Count;


                    var size = await MapEditor.TextInput.Display("Insert new Map Size. Comma Seperated for X and Y", width + "," + height);

                    var sizeSplit = size.Split(',');

                    controller.changeMapSize(int.Parse(sizeSplit[0]), int.Parse(sizeSplit[1]));
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error in Map Changing: " + ex.Message);
                }
            }
        }


        private void ShowElementDisplay(object sender, RoutedEventArgs e)
        {
            if (controller.Elements == null)
            {
                var res = MessageBox.Show("No config loaded. Load default Config?", "Load default Config?", MessageBoxButton.YesNo);
                if (res == MessageBoxResult.Yes)
                {
                    LoadDefaultConfigMenu(sender, e);
                }
            }

            if (controller.Elements != null)
            {

                if (elementDefSelectWindow != null)
                {
                    if (elementDefSelectWindow.IsVisible)
                    {
                        elementDefSelectWindow.Hide();
                        elementDefSelectWindow = null;
                    }
                }

                elementDefSelectWindow = new ElementDefinitionSelect(controller.Elements);
                elementDefSelectWindow.Show();

            }

        }

        private void ShowAnimationEdit(object sender, RoutedEventArgs e)
        {
            /*
            if (animationEdit != null)
            {
                if (animationEdit.IsVisible)
                {
                    animationEdit.Hide();
                    animationEdit = null;
                }
            }
             */

            var animationEdit = new AnimationEdit();
            animationEdit.Show();


        }


    }
}
