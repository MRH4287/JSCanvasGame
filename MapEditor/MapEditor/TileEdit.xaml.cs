using MapEditor.Elements;
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
using System.Windows.Shapes;

namespace MapEditor
{
    /// <summary>
    /// Interaktionslogik für ElementDisplay.xaml
    /// </summary>
    public partial class TileEdit : Window
    {
        private MapTile def = null;


        public TileEdit(MapTile definition)
        {
            this.def = definition;
            InitializeComponent();

            var tile = def.Tile;

            this.IDInput.DataContext = def;
            this.BottomElementIDInput.Text = tile.BottomElementID;
            this.MiddleElementIDInput.Text = tile.MiddleElementID;
            this.TopElementIDInput.Text = tile.TopElementID;

            System.Windows.RoutedEventHandler passableCallback = (s, e) =>
            {
                tile.Passable = this.PassableInput.IsChecked.Value;
            };

            this.PassableInput.IsChecked = tile.Passable;
            this.PassableInput.Checked += passableCallback;
            this.PassableInput.Unchecked += passableCallback;
            

            this.SpeedInput.Text = tile.Speed.ToString();
            this.SpeedInput.TextChanged += (s, e) =>
                {
                    try
                    {
                        tile.Speed = double.Parse(this.SpeedInput.Text);
                    }
                    catch
                    {
                        this.SpeedInput.Text = tile.Speed.ToString();
                    }
                };

            this.FlagsInput.ItemsSource = tile.Flags;
            this.DataInput.ItemsSource = tile.Data;

        }

        private void Window_Initialized(object sender, EventArgs e)
        {

           
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            var input = new TextInput((res) =>
            {
                def.Tile.Flags.Add(res);
            });

            input.Show();
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            if (this.FlagsInput.SelectedItem != null)
            {
                var text = this.FlagsInput.SelectedItem as string;

                this.def.Tile.Flags.Remove(text);
            }
        }

        private void DataAdd_Click(object sender, RoutedEventArgs e)
        {
            var input = new TextInput((res) =>
            {
                var split = res.Split('=');
                def.Tile.Data.Add(new KeyValuePair<string, string>(split[0], split[1]));


            }, "Insert Value", "KEY=VALUE");

            input.Show();
        }

        private void DataRemove_Click(object sender, RoutedEventArgs e)
        {
            var selected = this.DataInput.SelectedItem;

            if (selected == null)
            {
                return;
            }

            this.def.Tile.Data.Remove((KeyValuePair<string, string>)selected);
        }
    }
}
