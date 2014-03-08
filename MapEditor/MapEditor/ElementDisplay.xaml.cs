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
    public partial class ElementDisplay : Window
    {
        private ElementDefinition def = null;


        public ElementDisplay(ElementDefinition definition)
        {
            this.def = definition;
            InitializeComponent();


            this.Image.DataContext = def;

            this.IDInput.DataContext = def;
            this.NameInput.DataContext = def;

            this.LevelInput.SelectedIndex = (int)def.Level;
            this.LevelInput.SelectionChanged += (s, e) =>
                {
                    this.def.Level = (ElementLevel)this.LevelInput.SelectedIndex;
                };

            System.Windows.RoutedEventHandler passableCallback = (s, e) =>
            {
                this.def.Passable = this.PassableInput.IsChecked.Value;
            };

            this.PassableInput.IsChecked = def.Passable;
            this.PassableInput.Checked += passableCallback;
            this.PassableInput.Unchecked += passableCallback;
            

            this.SpeedInput.Text = def.Speed.ToString();
            this.SpeedInput.TextChanged += (s, e) =>
                {
                    try
                    {
                        this.def.Speed = double.Parse(this.SpeedInput.Text);
                    }
                    catch
                    {
                        this.SpeedInput.Text = def.Speed.ToString();
                    }
                };

            this.AnimationCheckbox.IsChecked = def.Dynamic;
            this.AnimContainer.IsEnabled = def.Dynamic;
            System.Windows.RoutedEventHandler animCheckedCallback = (s, e) =>
                {
                    def.Dynamic = this.AnimationCheckbox.IsChecked.Value;
                    this.AnimContainer.IsEnabled = def.Dynamic;
                };

            this.AnimationCheckbox.Checked += animCheckedCallback;
            this.AnimationCheckbox.Unchecked += animCheckedCallback;


            this.AnimDefInput.DataContext = def;
            this.ContainerInput.DataContext = def;
            this.DefaultAnimInput.DataContext = def;

            this.FlagsInput.ItemsSource = def.Flags;



        }

        private void Window_Initialized(object sender, EventArgs e)
        {

           
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            var input = new TextInput((res) =>
            {
                def.Flags.Add(res);
            });

            input.Show();
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            if (this.FlagsInput.SelectedItem != null)
            {
                var text = this.FlagsInput.SelectedItem as string;

                this.def.Flags.Remove(text);
            }
        }
    }
}
