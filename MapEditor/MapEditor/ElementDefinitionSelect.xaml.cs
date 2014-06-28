using MapEditor.Elements;
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
    /// Interaktionslogik für ElementDefinitionSelect.xaml
    /// </summary>
    public partial class ElementDefinitionSelect : Window
    {
        Dictionary<string, ElementDefinition> data;

        ElementDisplay display = null;

        public ElementDefinitionSelect(Dictionary<string, ElementDefinition> definitions)
        {
            this.data = definitions;

            InitializeComponent();
        }

        private void Window_Initialized(object sender, EventArgs e)
        {
            this.ElementList.ItemsSource = data.Select(el => el.Value).ToArray();


            this.MaxWidth = this.Width;
  
            this.MinHeight = this.Height;
            this.MinWidth = this.Width;
        }

        private void ElementList_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (display != null)
            {
                if (display.IsVisible)
                {
                    display.Hide();
                }

                display = null;
            }

            var def = this.ElementList.SelectedItem as ElementDefinition;

            if (def != null)
            {
                display = new ElementDisplay(def);
                display.Show();
            }
        }

        private void MenuItem_Click(object sender, RoutedEventArgs e)
        {
            (new ElementImporter()).Show();
        }
    }
}
